import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, withFormik, FormikProps, Field } from 'formik';
import * as Yup from 'yup';
import dynamic from 'next/dynamic';
import { SubmittableResult } from '@polkadot/api';
import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { addJsonToIpfs, getJsonFromIpfs, parseUrl } from '../utils/OffchainUtils';
import * as DfForms from '../utils/forms';
import { Text } from '@polkadot/types';
import { Option } from '@polkadot/types/codec';
import { PostId, Post, PostContent, PostUpdate, BlogId, PostExtension, RegularPost, PostBlock, BlockValue, PostBlockKind, CodeBlockValue, PreviewData, EmbedData, SiteMetaContent } from '../types';
import Section from '../utils/Section';
import { useMyAccount } from '../utils/MyAccountContext';
import { queryBlogsToProp, nonEmptyStr, isLink, TWITTER_REGEXP } from '../utils/index';
import { getNewIdFromEvent, Loading } from '../utils/utils';
import SimpleMDEReact from 'react-simplemde-editor';
import Router, { useRouter } from 'next/router';
import HeadMeta from '../utils/HeadMeta';
import { Dropdown, Menu, Icon /* Upload, message */ } from 'antd';
import '../utils/styles/full-width-content.css'
import AceEditor from 'react-ace'
import 'brace/mode/javascript'
import 'brace/mode/typescript'
import 'brace/mode/scss'
import 'brace/mode/html'
import 'brace/mode/powershell'
import 'brace/mode/rust'
import 'brace/theme/github'
import BlockPreview from './BlockPreview';
// import { UploadChangeParam } from 'antd/lib/upload';
// import { UploadFile } from 'antd/lib/upload/interface';

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

const buildSchema = () => Yup.object().shape({
  title: Yup.string()
    .required('Post title is required'),

  image: Yup.string()
    .url('Image must be a valid URL.')
});

type ValidationProps = {};

type BlockValues = {
  blockValues: Array<BlockValue | CodeBlockValue>
}

type OuterProps = ValidationProps & {
  blogId?: BlogId,
  id?: PostId,
  extention?: PostExtension,
  struct?: Post
  json?: PostContent,
  mappedBlocks: Array<BlockValue | CodeBlockValue>
  onlyTxButton?: boolean,
  closeModal?: () => void,
  withButtons?: boolean,
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
    // errors,
    setFieldValue,
    isSubmitting,
    setSubmitting,
    resetForm,
    onlyTxButton = false,
    withButtons = true,
    closeModal
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

  const {
    title,
    blockValues,
    image,
    tags,
    canonical
  } = values;

  const preparedBlogId = struct?.blog_id.toString() || blogId?.toString()

  const goToView = (id: PostId) => {
    Router.push(`/blogs/${preparedBlogId}/posts/${id}`).catch(console.log);
  };

  const [ ipfsHash, setIpfsCid ] = useState('');
  const [ linkPreviewData, setLinkPreviewData ] = useState<PreviewData[]>([])
  const [ inputFocus, setInputFocus ] = useState<{id: number, focus: boolean}[]>([])
  const [ embedData, setEmbedData ] = useState<EmbedData[]>([])
  // const [ imageBlocks, setImageBlocks ] = useState<{id: number, cid: string}[]>([])
  const [ firstload, setFirstload ] = useState(false)
  const [ isAdvanced, setIsAdvanced ] = useState(false)

  const langs = [ 'javascript', 'typescript', 'html', 'scss', 'rust', 'powershell' ]

  useEffect(() => {
    const firstLoad = async () => {
      const res: PreviewData[] = []
      for (const x of blockValues) {
        if (x.kind === 'link') {
          const data = await parse(x.data)
          if (!data) return
          res.push({ id: x.id, data })
        }
      }
      setLinkPreviewData(res)
      setFirstload(true)
    }

    if (!firstload) firstLoad()
  }, [])

  const mapValuesToBlocks = async () => {

    const processArray = async (array: Array<BlockValue | CodeBlockValue>) => {
      const res = []

      for (const item of array) {
        const hash = await addJsonToIpfs(item)

        res.push({
          kind: item.kind,
          hidden: item.hidden,
          cid: hash
        })
      }
      return res
    }

    if (values.blockValues && values.blockValues.length > 0) {
      const tempValues = await processArray(values.blockValues)
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
    console.log('_txResult on fail', _txResult)
    setSubmitting(false);
  };

  const onTxSuccess = (_txResult: SubmittableResult) => {
    console.log('_txResult on success', _txResult)
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
          blog_id: new Option(BlogId, null),
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

  const parse = async (url: string): Promise<SiteMetaContent | undefined> => {
    if (!nonEmptyStr(url) || !isLink(url)) return

    try {
      const res = await parseUrl(url)
      console.log('res from parser', res)
      return res
    } catch (err) {
      console.log('err in parse:', err)
      return undefined
    }
  }

  const getNewBlockId = (arr: any[]) => {
    const res = Math.max.apply(null, arr.map((o) => o.id))

    if (res >= 0) {
      return res + 1
    } else {
      return 0
    }
  }

  const addBlock = (type: PostBlockKind, afterIndex?: number) => {

    const defaultBlockValue: BlockValue = {
      id: getNewBlockId(blockValues),
      kind: type,
      hidden: false,
      data: ''
    }

    if (afterIndex === undefined) {
      setFieldValue('blockValues', [
        ...blockValues,
        defaultBlockValue
      ])
      return
    }

    setFieldValue('blockValues', [
      ...blockValues.slice(0, afterIndex + 1),
      defaultBlockValue,
      ...blockValues.slice(afterIndex + 1)
    ])
  }

  const removeBlock = (id: number) => {
    const idx = blockValues.findIndex((x) => x.id === id)

    setFieldValue('blockValues', [
      ...blockValues.slice(0, idx),
      ...blockValues.slice(idx + 1)
    ])
  }

  const handleLinkPreviewChange = async (block: BlockValue, value: string) => {

    if (value.match(TWITTER_REGEXP)) {

      const match = value.match(TWITTER_REGEXP);
      if (match && match[1]) {
        setEmbedData([
          ...embedData,
          { id: block.id, data: match[1], type: 'twitter' }
        ])
      }

    }

    const data = await parse(value)

    if (!data) return

    const newParsedData = [ ...linkPreviewData ]

    const idx = linkPreviewData.findIndex((el) => el.id === block.id);

    if (idx !== -1) {
      newParsedData[idx].data = data
    } else {
      newParsedData.push({
        id: block.id,
        data
      })
    }

    setLinkPreviewData(newParsedData)
  }

  const handleLinkChange = (block: BlockValue, name: string, value: string) => {
    const newArray = embedData.filter((x) => x.id !== block.id)
    setEmbedData(newArray)
    handleLinkPreviewChange(block, value)
    setFieldValue(name, value)
  }
  /*
  const loadImageToIpfs = (imgName: string, data: string, block: BlockValue, index: number) => {
    const update = { ...block, imgName, data }
    addJsonToIpfs(update).then((hash: string) => {
      const newArray = [ ...imageBlocks ]
      const idx = newArray.findIndex((x) => x.id === block.id)
      if (idx === -1) {
        newArray.push({ id: block.id, cid: hash })
      } else {
        newArray[idx].cid = hash
      }

      setImageBlocks(newArray)
      setFieldValue(`blockValues.${index}`, update)
    })
  }

  console.log(imageBlocks)
  */

  const changeBlockPosition = (order: number, index: number) => {

    const newBlocksOrder = [ ...blockValues ]
    newBlocksOrder[index] = blockValues[index + order]
    newBlocksOrder[index + order] = blockValues[index]

    setFieldValue('blockValues', newBlocksOrder)
  }

  const handleFocus = (focus: boolean, id: number) => {
    const idx = inputFocus.findIndex((x) => x.id === id)
    const newArray = [ ...inputFocus ]

    if (idx === -1) {
      newArray.push({
        id, focus
      })
    } else {
      newArray[idx].focus = focus
    }

    setInputFocus(newArray)
  }

  const renderPostBlock = (block: BlockValue | CodeBlockValue, index: number) => {
    let res

    /*
    const handleImage = (info: UploadChangeParam<UploadFile<any>>) => {
      // TODO: if image file size > some_number

      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        const reader = new FileReader();
        reader.onload = (event) => {
          console.log('File content:', event.target?.result);
          loadImageToIpfs(info.file.name, event.target?.result as string, block, index)
        };
        reader.readAsText(info.file.originFileObj as Blob)

        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    }
    */

    switch (block.kind) {
      case 'text': {
        res = <SimpleMDEReact
          value={block.data}
          onChange={(data: string) => setFieldValue(`blockValues.${index}.data`, data)}
          className={`DfMdEditor`}
          events={{
            blur: () => handleFocus(false, block.id),
            focus: () => handleFocus(true, block.id)
          }}
        />
        break
      }
      case 'link': {
        res = <Field
          type="text"
          name={`blockValues.${index}.data`}
          placeholder="Link"
          value={block.data}
          onFocus={() => handleFocus(true, block.id)}
          onBlur={() => handleFocus(false, block.id)}
          onChange={(e: React.FormEvent<HTMLInputElement>) => handleLinkChange(block, `blockValues.${index}.data`, e.currentTarget.value)}
        />
        break
      }
      case 'code': {
        const { lang } = block as CodeBlockValue
        res = <div className='EditPostAceEditor'>
          <Dropdown overlay={() => modesMenu(block.id)} className={'aceModeSelect'}>
            <a href='#' onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => e.preventDefault()}>
              <Icon type="down" /> Language: {lang || 'javascript'}
            </a>
          </Dropdown>
          <AceEditor
            mode={lang || 'javascript'}
            theme="github"
            onChange={(value: string) => setFieldValue(`blockValues.${index}.data`, value)}
            value={block.data}
            name="ace-editor"
            editorProps={{ $blockScrolling: true }}
            height='200px'
            width='100%'
            onFocus={() => handleFocus(true, block.id)}
            onBlur={() => handleFocus(false, block.id)}
          />
        </div>
        break
      }
      /*
      case 'image': {
        res = <Upload
          name='file'
          onChange={(info: UploadChangeParam<UploadFile<any>>) => handleImage(info)}
        >
          <Button>
            <Icon type="upload" /> Click to Upload
          </Button>
        </Upload>
        break
      }
      */
      default: {
        return null
      }
    }

    const maxBlockId = Math.max.apply(null, blockValues.map((x) => x.id))

    return <div className={inputFocus[block.id] && inputFocus[block.id].focus ? 'EditPostBlockWrapper inputFocus' : 'EditPostBlockWrapper'} key={block.id} >
      {res}
      <div className='navigationButtons'>
        <Dropdown overlay={() => addMenu(index)}>
          <Button type="button" className={'miniButton'}><Icon type="plus-circle" /> Add block</Button>
        </Dropdown>
        <Button type="button" onClick={() => removeBlock(block.id)} className={'miniButton'}>
          <Icon type="delete" />
          Delete
        </Button>
        <Button className={'miniButton'} type="button" onClick={() => setFieldValue(`blockValues.${index}.hidden`, !block.hidden)}>
          {block.hidden
            ? <div><Icon type="eye" />Show block</div>
            : <div><Icon type="eye-invisible" />Hide block</div>
          }
        </Button>
        { index > 0 &&
          <Button className={'miniButton'} type="button" onClick={() => changeBlockPosition(-1, index)} >
            <Icon type="up-circle" /> Move up
          </Button> }
        { index < maxBlockId &&
          <Button className={'miniButton'} type="button" onClick={() => changeBlockPosition(1, index)} >
            <Icon type="down-circle" /> Move down
          </Button> }
      </div>
    </div>

  }

  const addMenu = (index?: number) => (
    <Menu className='AddBlockDropdownMenu'>
      <Menu.Item key="1" onClick={() => addBlock('text', index)}>
        Text Block
      </Menu.Item>
      <Menu.Item key="2" onClick={() => addBlock('link', index)}>
        Link
      </Menu.Item>
      <Menu.Item key="3" onClick={() => addBlock('code', index)}>
        Code block
      </Menu.Item>
    </Menu>
  );

  const modesMenu = (id: number) => (
    <Menu className=''>
      {langs.map((x) => (
        <Menu.Item key={x} onClick={() => handleAceMode(x, id)} >
          {x.charAt(0).toUpperCase() + x.slice(1)}
        </Menu.Item>
      ))}
    </Menu>
  );

  const handleAceMode = (mode: string, id: number) => {
    const bvIdx = blockValues.findIndex((x) => x.id === id)
    setFieldValue(`blockValues.${bvIdx}.lang`, mode)
  }

  const handleAdvanced = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()
    setIsAdvanced(!isAdvanced)
  }

  const form =
    <Form className='ui form DfForm EditEntityForm'>

      {isRegularPost
        ? <>
          <LabelledText name='title' label='Post title' placeholder={`What is a title of you post?`} {...props} />

          <LabelledText name='image' label='Image URL' placeholder={`Should be a valid image URL.`} {...props} />

          {/* TODO ask a post summary or auto-generate and show under an "Advanced" tab. */}

          <div className='EditPostLabel'>
            Post Content:
          </div>

          <Dropdown overlay={addMenu} className={'EditPostAddButton'}>
            <Button type="button" className={'miniButton'}><Icon type="plus-circle" /> Add block</Button>
          </Dropdown>

          {blockValues && blockValues.length > 0
            ? blockValues.map((block: BlockValue, index: number) => renderPostBlock(block, index))
            : addBlock('text')
          }

          <div className='AdvancedWrapper'>
            <a href="#" onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleAdvanced(e)} >
              { isAdvanced ? <Icon type="up" /> : <Icon type="down" /> } Show Advanced Settings
            </a>
            {isAdvanced && <div>
              <LabelledText name='canonical' label='Canonical URL' placeholder={`Set canonical URL of your post`} {...props} />
            </div>}
          </div>

        </>
        : <>
          What should be here?
          { /* <SimpleMDEReact value={body} onChange={(data: string) => setFieldValue('body', data)} className={`DfMdEditor`}/> */}
        </>
      }
      {withButtons && <LabelledField {...props}>
        {renderTxButton()}
        {renderResetButton()}
      </LabelledField>}
    </Form>;

  const sectionTitle = isRegularPost ? (!struct ? `New post` : `Edit my post`) : 'Share post';

  const formTitle = () =>
    <>
      <a href={`/blogs/${preparedBlogId}`}>
        <ViewBlog nameOnly={true} id={struct?.blog_id || blogId} />
      </a>
      <span style={{ margin: '0 .75rem' }}>/</span>
      {sectionTitle}
    </>

  const editRegularPost = () =>
    <Section className='EditEntityBox' title={formTitle()}>
      {form}
    </Section>
  
  const editSharedPost = () =>
    <div style={{ marginTop: '1rem' }}>{form}</div>

  return onlyTxButton
    ? renderTxButton()
    : <>
      <HeadMeta title={sectionTitle}/>
      <Section className='EditEntityBox' title={sectionTitle}>
        <div className='EditPostWrapper'>
          <div className='EditPostForm'>
            {form}
          </div>
          <div className='EditPostPreview'>
            <div>Preview Data:</div>
            <div className='DfMd'>
              <h1>{title}</h1>
              {image && <img className='DfPostImage' src={image} />}
            </div>
            {blockValues && blockValues.length !== 0 &&
              blockValues.map((x: BlockValue | CodeBlockValue) => <BlockPreview
                key={x.id}
                block={x}
                embedData={embedData}
                setEmbedData={setEmbedData}
                linkPreviewData={linkPreviewData}
              />)
            }
          </div>
        </div>
      </Section>
    </>;
};

export const InnerEditPost = withFormik<OuterProps, FormValues>({

  mapPropsToValues: (props): FormValues => {
    const { struct, json, mappedBlocks } = props;
    let blockValues: Array<BlockValue | CodeBlockValue> = []
    if (mappedBlocks && mappedBlocks.length !== 0) {
      blockValues = mappedBlocks.map((x, i) => {
        return {
          ...x,
          id: i
        }
      })
    }

    if (struct && json && mappedBlocks) {
      return {
        ...json,
        blockValues
      };
    } else {
      return {
        title: '',
        blocks: [],
        blockValues: [],
        image: '',
        tags: [],
        canonical: ''
      };
    }
  },

  validationSchema: () => buildSchema(),

  handleSubmit: values => {
    console.log('formik values', values)
  }
})(InnerForm);

function withIdFromUrl (Component: React.ComponentType<OuterProps>) {
  return function (props: OuterProps) {
    const router = useRouter();
    const { postId } = router.query;
    const { id } = props;

    if (id) return <Component { ...props } />;

    try {
      return <Component id={new PostId(postId as string)} {...props}/>;
    } catch (err) {
      return <em>Invalid post ID: {postId}</em>;
    }
  };
}

function withBlogIdFromUrl (Component: React.ComponentType<OuterProps>) {
  return function (props: OuterProps) {
    const router = useRouter();
    const { blogId } = router.query;
    try {
      return <Component blogId={new BlogId(blogId as string)} { ...props } />;
    } catch (err) {
      return <em>Invalid blog ID: {blogId}</em>;
    }
  };
}

type LoadStructProps = OuterProps & {
  structOpt: Option<Post>
};

type StructJson = PostContent | undefined;
type Struct = Post | undefined;

function LoadStruct (Component: React.ComponentType<LoadStructProps>) {
  return function (props: LoadStructProps) {
    const { state: { address: myAddress } } = useMyAccount();
    const { structOpt } = props;
    const [ json, setJson ] = useState(undefined as StructJson);
    const [ struct, setStruct ] = useState(undefined as Struct);
    const [ trigger, setTrigger ] = useState(false);
    const [ mappedBlocks, setMappedBlocks ] = useState(undefined as unknown as BlockValue[])
    const jsonIsNone = json === undefined;

    const toggleTrigger = () => {
      json === undefined && setTrigger(!trigger);
    };

    useEffect(() => {
      if (!myAddress || !structOpt || structOpt.isNone) return toggleTrigger();

      setStruct(structOpt.unwrap());

      if (struct === undefined) return toggleTrigger();

      console.log('Loading post JSON from IPFS');

      getJsonFromIpfs<PostContent>(struct.ipfs_hash).then(json => {

        if (json.blocks && json.blocks.length > 0) {

          const processArray = async (arr: PostBlock[]) => {
            const temp: BlockValue[] = []
            for (const item of arr) {
              const res = await getJsonFromIpfs<BlockValue | CodeBlockValue>(item.cid)
              temp.push(res)
            }
            return temp
          }

          processArray(json.blocks as PostBlock[]).then((tempBlocks) => {
            setMappedBlocks(tempBlocks)
          })

          if (mappedBlocks === undefined) return toggleTrigger();

        }
        setJson(json);
      }).catch(err => console.log(err));
    }, [ trigger ]);

    if (!myAddress || !structOpt || jsonIsNone || !mappedBlocks) {
      return <Loading />;
    }

    if (structOpt.isNone) {
      return <em>Post not found</em>;
    }

    if (!struct || !struct.created.account.eq(myAddress)) {
      return <em>You have no rights to edit this post</em>;
    }

    return <Component {...props} struct={struct} json={json} mappedBlocks={mappedBlocks} />;
  };
}

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
  LoadStruct
);
