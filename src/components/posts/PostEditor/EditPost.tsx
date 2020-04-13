import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, withFormik, FormikProps } from 'formik';
import dynamic from 'next/dynamic';
import { SubmittableResult } from '@polkadot/api';
import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { addJsonToIpfs } from '../../utils/OffchainUtils';
import * as DfForms from '../../utils/forms';
import { Text } from '@polkadot/types';
import { Option } from '@polkadot/types/codec';
import { PostId, Post, PostContent, PostUpdate, BlogId, PostExtension, RegularPost, PostBlock, BlockValueKind, BlockValue, PostBlockKind, PreviewData, EmbedData } from '../../types';
import Section from '../../utils/Section';
import { queryBlogsToProp, parse } from '../../utils/index';
import { getNewIdFromEvent } from '../../utils/utils';
import Router from 'next/router';
import HeadMeta from '../../utils/HeadMeta';
import { Dropdown, Menu, Icon, Tabs, Button as AntButton} from 'antd';
import BlockPreview from '../PostPreview/BlockPreview';
import { ViewBlog } from '../../blogs/ViewBlog';
import { isMobile } from 'react-device-detect';
import SelectBlogPreview from '../../utils/SelectBlogPreview'
import { LabeledValue } from 'antd/lib/select';
import EditableTagGroup from '../../utils/EditableTagGroup'
import PostBlockFormik from './PostBlockFormik';
import buildSchema from './EditPostValidations'
import './EditPost.css'
import { withBlogIdFromUrl, withIdFromUrl, LoadStruct } from './EditPostDataHOC';

const TxButton = dynamic(() => import('../../utils/TxButton'), { ssr: false });
const { TabPane } = Tabs;
type ValidationProps = {};
type BlockValues = {
  blockValues: BlockValueKind[]
}

type OuterProps = ValidationProps & {
  blogId?: BlogId,
  id?: PostId,
  extention?: PostExtension,
  struct?: Post
  json?: PostContent,
  mappedBlocks?: BlockValueKind[]
  onlyTxButton?: boolean,
  closeModal?: () => void,
  withButtons?: boolean,
  myAddress?: string,
  blogIds?: BlogId[],
  tagsData?: string[]
};

type FormValues = PostContent & BlockValues;
type FormProps = OuterProps & FormikProps<FormValues>;
const LabelledField = DfForms.LabelledField<FormValues>();
const LabelledText = DfForms.LabelledText<FormValues>();

const InnerForm = (props: FormProps) => {
  const {
    id,
    blogId,
    struct,
    extention = new PostExtension({ RegularPost: new RegularPost() }),
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

  const isRegularPost = extention.value instanceof RegularPost;

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
  const initialBlogId: BlogId = struct?.blog_id || blogId as BlogId
  const preparedBlogId = struct?.blog_id.toString() || blogId?.toString()

  const goToView = (id: PostId) => {
    Router.push(`/blogs/${preparedBlogId}/posts/${id}`).catch(console.log);
  };

  const blockNames = [
    { name: 'text', pretty: 'Text Block' },
    { name: 'link', pretty: 'Link' },
    { name: 'image', pretty: 'Image' },
    { name: 'video', pretty: 'Video' },
    { name: 'code', pretty: 'Code Block' }
  ]

  const [ ipfsHash, setIpfsCid ] = useState('');
  const [ linkPreviewData, setLinkPreviewData ] = useState<PreviewData[]>([])
  const [ embedData, setEmbedData ] = useState<EmbedData[]>([])
  const [ firstload, setFirstload ] = useState(false)
  const [ isAdvanced, setIsAdvanced ] = useState(false)
  const [ currentBlogId, setCurrentBlogId ] = useState<BlogId>(initialBlogId)

  useEffect(() => {
    const firstLoad = async () => {
      const res: PreviewData[] = []
      for (const x of blockValues) {
        if (x.kind === 'link' || x.kind === 'video') {
          const data = await parse(x.data)
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
    const processArray = async (array: BlockValueKind[]) => {
      const res = []
      for (const item of array) {
        const hash = await addJsonToIpfs(item)
        res.push({ kind: item.kind, hidden: item.hidden, cid: hash })
      }
      return res
    }
    if (blockValues && blockValues.length > 0) {
      const tempValues = await processArray(blockValues)
      return tempValues as PostBlock[]
    }
    return [] as PostBlock[]
  }

  const onSubmit = async (sendTx: () => void) => {
    const blocks = await mapValuesToBlocks()
    if (isValid || !isRegularPost) {
      const json = { title, blocks, image, tags, canonical };
      addJsonToIpfs(json).then((hash: string) => {
        setIpfsCid(hash);
        sendTx();
      })
    }
  };

  const onTxCancelled = () => {
    setSubmitting(false);
  };

  const onTxFailed = (_txResult: SubmittableResult) => {
    setSubmitting(false);
  };

  const onTxSuccess = (_txResult: SubmittableResult) => {
    setSubmitting(false);
    closeModal && closeModal();
    const _id = id || getNewIdFromEvent<PostId>(_txResult);
    _id && isRegularPost && goToView(_id);
  };

  const buildTxParams = () => {
    if (isValid || !isRegularPost) {
      if (!struct) {
        return [ blogId, ipfsHash, extention ];
      } else {
        // TODO update only dirty values.
        const update = new PostUpdate({
          // TODO setting new blog_id will move the post to another blog.
          blog_id: new Option(BlogId, currentBlogId),
          ipfs_hash: new Option(Text, ipfsHash)
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
        ? 'blogs.updatePost'
        : 'blogs.createPost'
      }
      onClick={onSubmit}
      txCancelledCb={onTxCancelled}
      txFailedCb={onTxFailed}
      txSuccessCb={onTxSuccess}
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
      useOnPreview: false,
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

  const handleLinkChange = (block: BlockValueKind, name: string, value: string) => {
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

  const handleBlogSelect = (value: string|number|LabeledValue) => {
    if (!value) return;
    setCurrentBlogId(new BlogId(value as string))
  };

  const renderBlogsPreviewDropdown = () => {
    if (!blogIds) return;
    return <SelectBlogPreview
      className={'selectBlogPreview'}
      blogIds={blogIds}
      onSelect={handleBlogSelect}
      imageSize={24}
      defaultValue={currentBlogId.toString()} />
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
            <AntButton type="default" className={'smallAntButton'} size="small"><Icon type="plus-circle" /> Add block</AntButton>
          </Dropdown>
          {blockValues && blockValues.length > 0
            ? blockValues.map((block: BlockValueKind, index: number) => <PostBlockFormik
              block={block}
              index={index}
              setFieldValue={setFieldValue}
              handleLinkChange={handleLinkChange}
              blockValues={blockValues}
              addMenu={addMenu}
            />)
            : addBlock('text')
          }
          { blockValues && blockValues.length > 0 &&
            <Dropdown overlay={() => addMenu(blockValues.length + 1, false, 'after')} className={'EditPostAddButton'}>
              <AntButton type="default" className={'smallAntButton'} size="small"><Icon type="plus-circle" /> Add block</AntButton>
            </Dropdown>
          }
          <div className='AdvancedWrapper'>
            <a href="#" onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleAdvanced(e)} >
              { isAdvanced ? <Icon type="up" /> : <Icon type="down" /> } Show Advanced Settings
            </a>
            {isAdvanced && <div>
              <LabelledText name='canonical' label='Canonical URL' placeholder={`Set canonical URL of your post`} {...props} />
              <EditableTagGroup name='tags' tags={tags} label='Tags' tagsData={tagsData} setFieldValue={setFieldValue} />
            </div>}
          </div>
        </>
        : <>
          {blockValues && blockValues.length > 0
            ? blockValues.map((block: BlockValueKind, index: number) => <PostBlockFormik
              block={block}
              index={index}
              setFieldValue={setFieldValue}
              handleLinkChange={handleLinkChange}
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

  const sectionTitle = isRegularPost ? (!struct ? `New post` : `Edit my post`) : 'Share post';

  const formTitle = () => <>
    <a href={`/blogs/${preparedBlogId}`}>
      <ViewBlog nameOnly={true} id={struct?.blog_id || blogId} />
    </a>
    <span style={{ margin: '0 .75rem' }}>/</span>
    {sectionTitle}
  </>

  const editRegularPost = () => <Section className='EditEntityBox' title={formTitle()}>
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
                {blockValues && blockValues.length !== 0 &&
                  blockValues.filter((x) => x.useOnPreview).map((x: BlockValueKind) => <div key={x.id} className={'EditPostPreviewBlock'}><BlockPreview
                    block={x}
                    embedData={embedData}
                    setEmbedData={setEmbedData}
                    linkPreviewData={linkPreviewData}
                  /></div>)
                }
              </TabPane>
            </Tabs>
          </div>
        </div>
      }
    </Section>

  const renderForMobile = () => <Tabs type="card" className="mobileTabs">
      <TabPane tab="Editor" key="1">
        <div className='EditPostForm withTabs'>
          {form}
        </div>
      </TabPane>
      <TabPane tab="Full Preview" key="2">
        <div className='EditPostPreview withTabs'>
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
        <div className='EditPostPreview withTabs'>
          <div>
            <h1>{title}</h1>
          </div>
          {blockValues && blockValues.length !== 0 &&
            blockValues.filter((x) => x.useOnPreview).map((x: BlockValueKind) => <div key={x.id} className={'EditPostPreviewBlock'}><BlockPreview
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
      <HeadMeta title={sectionTitle}/>
      {isRegularPost
        ? editRegularPost()
        : editSharedPost()
      }
    </>;
};

export const InnerEditPost = withFormik<OuterProps, FormValues>({
  mapPropsToValues: (props): FormValues => {
    const { struct, json, mappedBlocks } = props;
    let blockValues: BlockValueKind[] = []
    if (mappedBlocks && mappedBlocks.length !== 0) blockValues = mappedBlocks.map((x, i) => ({ ...x, id: i }))
    if (struct && json && mappedBlocks) return { ...json, blockValues };
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
    queryBlogsToProp('postById', { paramName: 'id', propName: 'structOpt' })
  ),
  LoadStruct,
  withCalls<OuterProps>(
    queryBlogsToProp(`blogIdsByOwner`, { paramName: 'myAddress', propName: 'blogIds' })
  )
);
