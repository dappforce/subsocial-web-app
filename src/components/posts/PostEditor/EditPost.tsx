import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, withFormik, FormikProps } from 'formik';
import dynamic from 'next/dynamic';
import { SubmittableResult } from '@polkadot/api';
import { withCalls, withMulti, registry } from '@polkadot/react-api';
import * as DfForms from '../../utils/forms';
import { Null } from '@polkadot/types';
import { Option } from '@polkadot/types/codec';
import { PostBlock, BlockValueKind, BlockValue, PostBlockKind, PreviewData, EmbedData, PostContent, ImageBlockValue, BlockValueWithOptions } from '../../types';
import Section from '../../utils/Section';
import { parse, getImageFromIpfs } from '../../utils/index';
import { getNewIdFromEvent } from '../../utils/utils';
import Router from 'next/router';
import HeadMeta from '../../utils/HeadMeta';
import { Dropdown, Menu, Icon, Tabs, Button as AntButton} from 'antd';
import BlockPreview from '../PostPreview/BlockPreview';
import { isMobile } from 'react-device-detect';
import SelectBlogPreview from '../../utils/SelectBlogPreview'
import { LabeledValue } from 'antd/lib/select';
import EditableTagGroup from '../../utils/EditableTagGroup'
import PostBlockFormik from './PostBlockFormik';
import buildSchema from './EditPostValidations'
import './EditPost.css'
import { withBlogIdFromUrl, withIdFromUrl, LoadStruct, OuterProps } from './LoadEditPostUtils';
import { useSubsocialApi } from '../../utils/SubsocialApiContext'
import { socialQueryToProp } from '../../utils/index';
import BN from 'bn.js';
import { TxFailedCallback } from '@polkadot/react-components/Status/types';
import { TxCallback } from '../../utils/types';
import { PostExtension, PostUpdate } from '@subsocial/types/substrate/classes';
import { IpfsHash } from '@subsocial/types/substrate/interfaces';
// import { PostContent } from '@subsocial/types/offchain';
import { newLogger } from '@subsocial/utils'
import BloggedSectionTitle from '../../blogs/BloggedSectionTitle';
import ViewTags from 'src/components/utils/ViewTags';
const StatsPanel = dynamic(() => import('../../posts/PostStats'), { ssr: false });


const log = newLogger('Edit post')
const TxButton = dynamic(() => import('../../utils/TxButton'), { ssr: false });
const { TabPane } = Tabs;

type BlockValues = {
  blockValues: BlockValueWithOptions[]
}

const DefaultPostExt = new PostExtension({ RegularPost: new Null(registry) })
type FormValues = PostContent & BlockValues;
type FormProps = OuterProps & FormikProps<FormValues>;
const LabelledField = DfForms.LabelledField<FormValues>();
const LabelledText = DfForms.LabelledText<FormValues>();

const InnerForm = (props: FormProps) => {
  const {
    id,
    blogId,
    struct,
    extension = DefaultPostExt,
    values,
    dirty,
    isValid,
    setFieldValue,
    isSubmitting,
    setSubmitting,
    resetForm,
    onlyTxButton = false,
    withButtons = true,
    closeModal,
    blogIds,
    tagsData = [ 'qwe', 'asd', 'zxc' ]
  } = props;

  const isRegularPost = extension.value.isEmpty; // TODO maybe fix after run UI

  const renderResetButton = () => (
    <Button
      type='button'
      size='medium'
      disabled={isSubmitting || (isRegularPost && !dirty)}
      onClick={() => resetForm()}
      content='Reset form'
    />
  );

  const { title, blockValues, image, tags, canonical } = values;
  const initialBlogId = struct?.blog_id || blogId

  const goToView = (id: BN) => {
    Router.push(`/blogs/${currentBlogId}/posts/${id}`).catch(err => log.error('Failed redirection to post page:', err));
  };

  const blockNames = [
    { name: 'text', pretty: 'Text Block' },
    { name: 'link', pretty: 'Link' },
    { name: 'image', pretty: 'Image' },
    { name: 'video', pretty: 'Video' },
    { name: 'code', pretty: 'Code Block' }
  ]

  const { ipfs } = useSubsocialApi()
  const [ ipfsHash, setIpfsCid ] = useState<IpfsHash>();
  const [ linkPreviewData, setLinkPreviewData ] = useState<PreviewData[]>([])
  const [ embedData, setEmbedData ] = useState<EmbedData[]>([])
  const [ firstload, setFirstload ] = useState(false)
  const [ isAdvanced, setIsAdvanced ] = useState(false)
  const [ currentBlogId, setCurrentBlogId ] = useState(initialBlogId)

  useEffect(() => {
    const firstLoad = async () => {
      const res: PreviewData[] = []
      for (const x of blockValues) {
        if (x.kind === 'link' || x.kind === 'video') {
          const data = await parse(x.data)
          if (!data) continue
          res.push({ id: x.id, data })
        }
        if (x.kind === 'image') {
          const img = x as ImageBlockValue
          let data: any
          if (img.hash) data = await getImageFromIpfs(img.hash)
          if (!data) continue
          res.push({ id: x.id, data })
        }
      }
      setLinkPreviewData(res)
      setFirstload(true)
    }

    if (!firstload) firstLoad()
  }, [])

  const mapValuesToBlocks = async () => {
    const processArray = async (array: BlockValueWithOptions[]) => {
      const res = []
      for (const item of array) {
        const hash = await ipfs.savePost(item as any)
        res.push({ kind: item.kind, hidden: item.hidden, featured: item.featured, cid: hash })
      }
      return res
    }
    if (blockValues && blockValues.length > 0) {
      const tempValues = await processArray(blockValues)
      return tempValues as any[]
    }
    return [] as PostBlock[]
  }

  const onSubmit = async (sendTx: () => void) => {
    const blocks = await mapValuesToBlocks()
    if (isValid || !isRegularPost) {
      const json = { title, blocks, image, tags, canonical };
      ipfs.savePost(json as any).then(hash => {
        if (hash) {
          setIpfsCid(hash);
          sendTx();
        }
      }).catch(err => new Error(err));
    }
  };

  const onTxFailed: TxFailedCallback = (_txResult: SubmittableResult | null) => {
    setSubmitting(false);
  };

  const onTxSuccess: TxCallback = (_txResult: SubmittableResult) => {
    setSubmitting(false);

    closeModal && closeModal();

    const _id = id || getNewIdFromEvent(_txResult);
    _id && isRegularPost && goToView(_id);
  };

  const buildTxParams = () => {
    if (isValid || !isRegularPost) {
      if (!struct) {
        return [ blogId, ipfsHash, extension ];
      } else {
        // TODO update only dirty values.
        const update = new PostUpdate(
          {
          // TODO setting new blog_id will move the post to another blog.
            blog_id: new Option(registry, 'u64', null),
            ipfs_hash: new Option(registry, 'Text', ipfsHash)
          });
        return [ struct.id, update ];
      }
    } else {
      return [];
    }
  };

  const renderTxButton = () => (
    <TxButton
      type='submit'
      size='medium'
      label={!struct
        ? `Create a post`
        : `Update a post`
      }
      isDisabled={isSubmitting || (isRegularPost && !dirty)}
      params={buildTxParams()}
      tx={struct
        ? 'social.updatePost'
        : 'social.createPost'
      }
      onClick={onSubmit}
      onFailed={onTxFailed}
      onSuccess={onTxSuccess}
    />
  );

  const getNewBlockId = (arr: any[]) => {
    const res = Math.max.apply(null, arr.map((o) => o.id))
    if (res >= 0) return res + 1
    return 0
  }

  const addBlock = (type: PostBlockKind, index?: number, pos?: string) => {
    const defaultBlockValue: BlockValueKind = {
      id: getNewBlockId(blockValues),
      kind: type,
      hidden: false,
      data: ''
    }
    if (index === undefined) {
      let newArray: BlockValueKind[] = []
      if (pos === 'after') {
        newArray = [ ...blockValues, defaultBlockValue ]
      } else {
        newArray = [ defaultBlockValue, ...blockValues ]
      }
      setFieldValue('blockValues', newArray)
      return
    }
    let value = index + 1
    if (pos === 'before') value = index
    setFieldValue('blockValues', [
      ...blockValues.slice(0, value),
      defaultBlockValue,
      ...blockValues.slice(value)
    ])
  }

  const handleLinkPreviewChange = async (block: BlockValueKind, value: string) => {
    const data = await parse(value)
    if (!data) return
    const newParsedData = [ ...linkPreviewData ]
    const idx = linkPreviewData.findIndex((el) => el.id === block.id);
    if (idx !== -1) {
      newParsedData[idx].data = data
    } else {
      newParsedData.push({ id: block.id, data })
    }
    setLinkPreviewData(newParsedData)
  }

  const handleImagePreviewChange = async (block: ImageBlockValue, data: string | any) => {
    const newParsedData = [ ...linkPreviewData ]
    const idx = linkPreviewData.findIndex((el) => el.id === block.id);
    if (idx !== -1) {
      newParsedData[idx].data = data
    } else {
      newParsedData.push({ id: block.id, data })
    }
    setLinkPreviewData(newParsedData)
  }

  const handleLinkChange = async (block: BlockValueKind, name: string, value: string) => {
    handleLinkPreviewChange(block, value)
    setFieldValue(name, value)
  }

  const addMenu = (index?: number, onlyItems?: boolean, pos?: string) => {
    if (onlyItems) {
      return blockNames.map((x) => <Menu.Item key={x.name} onClick={() => addBlock(x.name as PostBlockKind, index, pos)}>
        {x.pretty}
      </Menu.Item>)
    }
    return <Menu className='AddBlockDropdownMenu'>
      {blockNames.map((x) => <Menu.Item key={x.name} onClick={() => addBlock(x.name as PostBlockKind, index, pos)}>
        {x.pretty}
      </Menu.Item>)}
    </Menu>
  };

  const handleAdvanced = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()
    setIsAdvanced(!isAdvanced)
  }

  const handleBlogSelect = (value: string | number | LabeledValue) => {
    if (!value) return;

    setCurrentBlogId(new BN(value as string))
  };

  const renderBlogsPreviewDropdown = () => {
    if (!blogIds) return;
    return <SelectBlogPreview
      blogIds={blogIds}
      onSelect={handleBlogSelect}
      imageSize={24}
      defaultValue={currentBlogId?.toString()} />
  }

  const form = <Form className='ui form DfForm EditEntityForm'>
      {isRegularPost
        ? <>
          <div className='EditPostLabel'>
            Post in blog:
          </div>
          {renderBlogsPreviewDropdown()}
          <LabelledText name='title' label='Post title' placeholder={`What is a title of you post?`} {...props} />
          {/* TODO ask a post summary or auto-generate and show under an "Advanced" tab. */}
          <Dropdown overlay={addMenu} className={'EditPostAddButton'}>
            <AntButton type="default" className={'SmallAntButton'} size="small"><Icon type="plus-circle" /> Add block</AntButton>
          </Dropdown>
          {blockValues && blockValues.length > 0
            ? blockValues.map((block: BlockValueWithOptions, index: number) => <PostBlockFormik
              block={block}
              index={index}
              setFieldValue={setFieldValue}
              handleLinkChange={handleLinkChange}
              handleImagePreviewChange={handleImagePreviewChange}
              blockValues={blockValues}
              addMenu={addMenu}
            />)
            : addBlock('text')
          }
          { blockValues && blockValues.length > 0 &&
            <Dropdown overlay={() => addMenu(blockValues.length + 1, false, 'after')} className={'EditPostAddButton'}>
              <AntButton type="default" className={'SmallAntButton'} size="small"><Icon type="plus-circle" /> Add block</AntButton>
            </Dropdown>
          }
          <div className='AdvancedWrapper'>
            <a href="#" onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleAdvanced(e)} >
              { isAdvanced ? <Icon type="up" /> : <Icon type="down" /> } Show Advanced Settings
            </a>
            {isAdvanced && <div>
              <LabelledText name='canonical' label='Canonical URL' placeholder={`Set canonical URL of your post`} {...props} />
              <EditableTagGroup name='tags' tags={tags} label='Tags' tagSuggestions={tagsData} setFieldValue={setFieldValue} />
            </div>}
          </div>
        </>
        : <>
          {blockValues && blockValues.length > 0
            ? blockValues.map((block: BlockValueWithOptions, index: number) => <PostBlockFormik
              block={block}
              index={index}
              setFieldValue={setFieldValue}
              handleLinkChange={handleLinkChange}
              handleImagePreviewChange={handleImagePreviewChange}
              blockValues={blockValues}
              addMenu={addMenu}
            />)
            : addBlock('text')
          }
        </>
      }
      {withButtons && <LabelledField {...props}>
        {renderTxButton()}
        {renderResetButton()}
      </LabelledField>}
    </Form>;

  const pageTitle = isRegularPost ? (!struct ? `New post` : `Edit my post`) : 'Share post';
  const sectionTitle = currentBlogId && <BloggedSectionTitle blogId={currentBlogId} title={pageTitle} />

  const editRegularPost = () => <Section className='EditEntityBox' title={sectionTitle}>
      { isMobile
        ? renderForMobile()
        : <div className='EditPostWrapper'>
          <div className='EditPostForm'>
            {form}
          </div>
          <div className='EditPostPreview'>
            <Tabs type="card">
              <TabPane tab="Full Preview" key="1">
                <div>
                  <h1>{title}</h1>
                </div>
                {blockValues && blockValues.length !== 0 &&
                  blockValues.map((x: BlockValueKind) => <div key={x.id} className={'EditPostPreviewBlock'}><BlockPreview
                    block={x}
                    embedData={embedData}
                    setEmbedData={setEmbedData}
                    linkPreviewData={linkPreviewData}
                  /></div>)
                }
              </TabPane>
              <TabPane tab="Short Preview" key="2">
                <div>
                  <h1>{title}</h1>
                </div>
                <div className='ShortPreviewWrapper'>
                  {blockValues && blockValues.length !== 0 &&
                    blockValues.filter((x) => x.featured).map((x: BlockValueKind) => <div key={x.id} className={'EditPostPreviewBlock'}><BlockPreview
                      block={x}
                      embedData={embedData}
                      setEmbedData={setEmbedData}
                      linkPreviewData={linkPreviewData}
                    /></div>)
                  }
                  <ViewTags tags={values.tags} />
                  <StatsPanel id={currentBlogId} />
                </div>
              </TabPane>
            </Tabs>
          </div>
        </div>
      }
    </Section>

  const renderForMobile = () => <Tabs type="card" className="MobileTabs">
      <TabPane tab="Editor" key="1">
        <div className='EditPostForm WithTabs'>
          {form}
        </div>
      </TabPane>
      <TabPane tab="Full Preview" key="2">
        <div className='EditPostPreview WithTabs'>
          <div className='DfMd'>
            <h1>{title}</h1>
          </div>
          {blockValues && blockValues.length !== 0 &&
            blockValues.map((x: BlockValue) => <div key={x.id} className={'EditPostPreviewBlock'}><BlockPreview
              key={x.id}
              block={x}
              embedData={embedData}
              setEmbedData={setEmbedData}
              linkPreviewData={linkPreviewData}
            /></div>)
          }
        </div>
      </TabPane>
      <TabPane tab="Short Preview" key="3">
        <div className='EditPostPreview WithTabs'>
          <div>
            <h1>{title}</h1>
          </div>
          {blockValues && blockValues.length !== 0 &&
            blockValues.filter((x) => x.featured).map((x: BlockValueKind) => <div key={x.id} className={'EditPostPreviewBlock'}><BlockPreview
              block={x}
              embedData={embedData}
              setEmbedData={setEmbedData}
              linkPreviewData={linkPreviewData}
            /></div>)
          }
        </div>
      </TabPane>
    </Tabs>

  const editSharedPost = () => <div style={{ marginTop: '1rem' }}>{form}</div>

  return onlyTxButton
    ? renderTxButton()
    : <>
      <HeadMeta title={pageTitle}/>
      {isRegularPost
        ? editRegularPost()
        : editSharedPost()
      }
    </>;
};

export const InnerEditPost = withFormik<OuterProps, FormValues>({
  mapPropsToValues: (props): FormValues => {
    const { struct, json, mappedBlocks } = props;
    let blockValues: BlockValueWithOptions[] = []
    if (mappedBlocks && mappedBlocks.length !== 0) blockValues = mappedBlocks.map((x, i) => ({ ...x, id: i }))
    if (struct && json && mappedBlocks) return { ...json, blocks: [], blockValues };
    return { title: '', blocks: [], blockValues: [], image: '', tags: [], canonical: '' };
  },
  validationSchema: () => buildSchema(),
  handleSubmit: values => { console.log('formik values', values) }
})(InnerForm);

export const NewPost = withMulti(
  InnerEditPost,
  withBlogIdFromUrl
);
export const NewSharePost = InnerEditPost;
export const EditPost = withMulti<OuterProps>(
  InnerEditPost,
  withIdFromUrl,
  withCalls<OuterProps>(
    socialQueryToProp('postById', { paramName: 'id', propName: 'structOpt' })
  ),
  LoadStruct,
  withCalls<OuterProps>(
    socialQueryToProp(`blogIdsByOwner`, { paramName: 'myAddress', propName: 'blogIds' })
  )
);