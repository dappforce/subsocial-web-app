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
import { PostId, Post, PostContent, PostUpdate, BlogId, PostExtension, RegularPost, PostBlock, BlockValue, PostBlockKind } from '../types';
import Section from '../utils/Section';
import { useMyAccount } from '../utils/MyAccountContext';
import { queryBlogsToProp, nonEmptyStr, isLink } from '../utils/index';
import { getNewIdFromEvent, Loading } from '../utils/utils';
import SimpleMDEReact from 'react-simplemde-editor';
import Router, { useRouter } from 'next/router';
import HeadMeta from '../utils/HeadMeta';
import { Collapse, Dropdown, Menu, Icon } from 'antd';
import '../utils/styles/full-width-content.css'
import { DfMd } from '../utils/DfMd';
import { Tweet } from 'react-twitter-widgets'
import AceEditor from 'react-ace'
import 'brace/mode/javascript'
import 'brace/mode/typescript'
import 'brace/mode/scss'
import 'brace/mode/html'
import 'brace/mode/powershell'
import 'brace/mode/rust'
import 'brace/theme/github'

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });
const { Panel } = Collapse;

const buildSchema = () => Yup.object().shape({
  title: Yup.string()
    // .min(p.minTitleLen, `Title is too short. Minimum length is ${p.minTitleLen} chars.`)
    // .max(p.maxTitleLen, `Title is too long. Maximum length is ${p.maxTitleLen} chars.`)
    .required('Post title is required'),

  image: Yup.string()
    .url('Image must be a valid URL.')
    // .max(URL_MAX_LEN, `Image URL is too long. Maximum length is ${URL_MAX_LEN} chars.`),
});

// ------------------------------------------
// Contents: save this content in IPFS and save returned CID.hash in cid field of PostBlock objects.

// type MdTextContent = string

export interface SiteMetaContent {
  og?: {
    title?: string,
    description?: string,
    image: string,
    url: string
  },
  title?: string,
  description?: string
}

type PreviewData = {
  id: number,
  data: SiteMetaContent
}

type EmbedData = {
  id: number,
  data: string,
  type: string
}

/*
interface VideoPreviewImage {
  url: string
  width?: number
  height?: number
}

interface VideoAuthor {
  id: string
  url: string
  name: string
}

interface VideoMetaContent {
  id?: string
  url?: string
  title?: string
  description?: string
  date?: string
  image?: VideoPreviewImage
  author?: VideoAuthor
}
*/
type ValidationProps = {
  // postMaxLen: number,
  // postMaxLen: U32
};

// type MappedBlocks = TextBlock | CodeBlock | VideoBlock | ImageBlock

type BlockValues = {
  blockValues: BlockValue[]
}

type OuterProps = ValidationProps & {
  blogId?: BlogId,
  id?: PostId,
  extention?: PostExtension,
  struct?: Post
  json?: PostContent,
  mappedBlocks: BlockValue[]
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

  const goToView = (id: PostId) => {
    Router.push(`/blogs/${blogId}/posts/${id}`).catch(console.log);
  };

  const [ ipfsHash, setIpfsCid ] = useState('');
  const [ linkPreviewData, setLinkPreviewData ] = useState<PreviewData[]>([])
  const [ inputFocus, setInputFocus ] = useState<{id: number, focus: boolean}[]>([])
  const [ aceModes, setAceModes ] = useState<{id: number, mode: string }[]>([])
  const [ embedData, setEmbedData ] = useState<EmbedData[]>([])
  const VIMEO_REGEX = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
  const YOUTUBE_REGEXP = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const TWITTER_REGEXP = /(?:http:\/\/)?(?:www\.)?twitter\.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w-]*\/)*([\w-]*)/;

  const onSubmit = async (sendTx: () => void) => {

    const mapValuesToBlocks = async () => {

      const tempValues: PostBlock[] = []

      if (values.blockValues && values.blockValues.length > 0) {
        values.blockValues.map(async (x) => {

          try {
            const hash = await addJsonToIpfs(x)
            console.log('hash', hash)
            tempValues.push({
              kind: x.kind,
              hidden: x.hidden,
              cid: hash
            })
          } catch (err) {
            console.log(err)
          }

        })
      }
      return tempValues

    }

    const blocks = await mapValuesToBlocks()

    console.log('currentValues blocks', blocks)

    if (isValid || !isRegularPost) {
      console.log('currentValues from main blocks', blocks)
      const json = { title, blocks, image, tags, canonical };

      console.log('main json record', json)

      const hash = await addJsonToIpfs(json)

      setIpfsCid(hash);
      console.log('hash main', hash)
      sendTx();
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

  const addBlock = (type: PostBlockKind, afterIndex: number | undefined) => {

    const defaultBlockValue = {
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

    const idx = linkPreviewData.findIndex((el) => el.id === block.id);

    let newItem = {
      id: block.id,
      data: data
    }

    if (idx !== -1) {
      const oldItem = linkPreviewData[idx];
      newItem = { ...oldItem, data };
    }

    const newParsedData = [
      ...linkPreviewData.slice(0, idx),
      newItem,
      ...linkPreviewData.slice(idx + 1)
    ];

    setLinkPreviewData(newParsedData)
  }

  const handleLinkChange = (block: BlockValue, name: string, value: string) => {
    const newArray = embedData.filter((x) => x.id !== block.id)
    setEmbedData(newArray)
    handleLinkPreviewChange(block, value)
    setFieldValue(name, value)
  }

  const changeBlockPosition = (order: number, index: number) => {

    const newBlocksOrder = [
      ...blockValues
    ]
    newBlocksOrder[index] = blockValues[index + order]
    newBlocksOrder[index + order] = blockValues[index]

    setFieldValue('blockValues', newBlocksOrder)
  }

  const renderPostBlock = (block: BlockValue, index: number) => {
    let res

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
        const currentMode = aceModes.find((x) => x.id === block.id)
        res = <div className='EditPostAceEditor'>
          <Dropdown overlay={() => modesMenu(block.id)} className={'aceModeSelect'}>
            <div className='aceModeButton'>
              Language: {currentMode?.mode || 'javascript'}
            </div>
          </Dropdown>
          <AceEditor
            mode={currentMode?.mode || 'javascript'}
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
      default: {
        return null
      }
    }

    const maxBlockId = Math.max.apply(null, blockValues.map((x) => x.id))

    return <div className={inputFocus[block.id] && inputFocus[block.id].focus ? 'EditPostBlockWrapper inputFocus' : 'EditPostBlockWrapper'} key={block.id} >
      {res}
      <div className='navigationButtons'>
        <Dropdown overlay={() => addMenu(index)}>
          <Button type="button"><Icon type="plus-circle" /> Add block</Button>
        </Dropdown>
        <Button type="button" onClick={() => removeBlock(block.id)}>
          <Icon type="delete" />
          Delete
        </Button>
        <Button type="button" onClick={() => setFieldValue(`blockValues.${index}.hidden`, !block.hidden)}>
          {block.hidden
            ? <div><Icon type="eye" />Show block</div>
            : <div><Icon type="eye-invisible" />Hide block</div>
          }
        </Button>
        { index > 0 &&
          <Button type="button" onClick={() => changeBlockPosition(-1, index)} >
            <Icon type="up-circle" /> Move up
          </Button> }
        { index < maxBlockId &&
          <Button type="button" onClick={() => changeBlockPosition(1, index)} >
            <Icon type="down-circle" /> Move down
          </Button> }
      </div>
    </div>

  }

  const renderBlockPreview = (x: BlockValue) => {
    if (x.hidden) return null

    const handleEmbed = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, url: string, id: number) => {
      if (!nonEmptyStr(url) || !isLink(url)) return

      let data
      const newArray = [ ...embedData ]
      let type = ''

      if (url.match(YOUTUBE_REGEXP)) {
        e.preventDefault()
        const match = url.match(YOUTUBE_REGEXP);
        if (match && match[2]) {
          data = match[2]
          type = 'youtube'
        }
      }

      if (url.match(VIMEO_REGEX)) {
        e.preventDefault()
        const match = url.match(VIMEO_REGEX);
        if (match && match[3]) {
          data = match[3]
          type = 'vimeo'
        }
      }

      if (!data) return

      const idx = embedData.findIndex((x) => x.id === id)
      if (idx === -1) {
        newArray.push({ id, data, type })
      } else {
        newArray[idx].data = data
      }

      setEmbedData(newArray)
    }

    const renderEmbed = (embedData: EmbedData) => {
      switch (embedData.type) {
        case 'youtube': {
          return <iframe src={`https://www.youtube.com/embed/${embedData?.data}`}
            frameBorder='0'
            allow='autoplay; encrypted-media'
            allowFullScreen
            width='480px'
            height='300px'
            title={`video${embedData?.data}`}
          />
        }
        case 'vimeo': {
          return <iframe src={`https://player.vimeo.com/video/${embedData?.data}?autoplay=1&loop=1&autopause=0`}
            width="480"
            height="300"
            allow="autoplay; fullscreen"
            frameBorder={0}
          />
        }
        case 'twitter': {
          console.log('twitter works')
          return <Tweet tweetId={embedData?.data}/>
        }
        case 'default': {
          return <div>default embed</div>
        }
      }
      return null
    }

    let element

    switch (x.kind) {
      case 'link': {
        if (!isLink(x.data)) {
          element = <div>{x.data}</div>
          break
        }

        const previewData = linkPreviewData.find((y) => y.id === x.id)

        if (!previewData) break

        const { data: { og } } = previewData

        const currentEmbed = embedData.find((y) => y.id === x.id)

        element = <div>
          <div>
            <a
              href={og?.url}
              target='_blank'
              rel='noopener noreferrer'
              onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleEmbed(e, og?.url as string, x.id)}
            >
              {currentEmbed
                ? renderEmbed(currentEmbed)
                : <div>
                  <img src={og?.image} className='DfPostImage' />
                  <p><b>{og?.title}</b></p>
                  <p>{og?.description}</p>
                </div>}
            </a>
          </div>
        </div>
        break
      }
      case 'text': {
        element = <DfMd source={x.data} />
        break
      }
      case 'code': {
        const currentMode = aceModes.find((y) => y.id === x.id)
        element = <AceEditor
          mode={currentMode?.mode || 'javascript'}
          theme="github"
          value={x.data}
          name="ace-editor-readonly"
          readOnly={true}
          editorProps={{ $blockScrolling: true }}
          height='200px'
          width='480px'
        />
        break
      }
      default: {
        element = null
      }
    }

    return <div key={x.id} className={'EditPostPreviewBlock'}>
      {element}
    </div>
  }

  const addMenu = (index: number | undefined) => (
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

  const handleAceMode = (mode: string, id: number) => {
    const idx = aceModes.findIndex((x) => x.id === id)
    const newArray = [ ...aceModes ]
    if (idx === -1) {
      newArray.push({ id, mode })
    } else {
      newArray[idx].mode = mode
    }

    setAceModes(newArray)
  }

  const modesMenu = (id: number) => (
    <Menu className=''>
      <Menu.Item key="1" onClick={() => handleAceMode('javascript', id)} >
        JavaScript
      </Menu.Item>
      <Menu.Item key="2" onClick={() => handleAceMode('typescript', id)} >
        TypeScript
      </Menu.Item>
      <Menu.Item key="3" onClick={() => handleAceMode('html', id)} >
        HTML
      </Menu.Item>
      <Menu.Item key="4" onClick={() => handleAceMode('scss', id)} >
        CSS
      </Menu.Item>
      <Menu.Item key="5" onClick={() => handleAceMode('rust', id)} >
        Rust
      </Menu.Item>
      <Menu.Item key="6" onClick={() => handleAceMode('powershell', id)} >
        Powershell
      </Menu.Item>
    </Menu>
  );

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

          {blockValues && blockValues.length > 0 && (
            blockValues.map((block: BlockValue, index: number) => renderPostBlock(block, index))
          )}

          <Dropdown overlay={addMenu} className={'EditPostAddButton'}>
            <div className='defaultAddBlockButton'>
              <Icon type="plus-circle" />Add block
            </div>
          </Dropdown>

          <Collapse className={'EditPostCollapse'}>
            <Panel header="Show Advanced Settings" key="1">
              <LabelledText name='canonical' label='Canonical URL' placeholder={`Set canonical URL of your post`} {...props} />
            </Panel>
          </Collapse>
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

  const sectionTitle = isRegularPost ? (!struct ? `New post` : `Edit my post`) : '';

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
              blockValues.map((x: BlockValue) => renderBlockPreview(x))
            }
          </div>
        </div>
      </Section>
    </>;
};

export const InnerEditPost = withFormik<OuterProps, FormValues>({

  // Transform outer props into form values
  mapPropsToValues: (props): FormValues => {
    const { struct, json, mappedBlocks } = props;
    let blockValues: BlockValue[] = []
    if (mappedBlocks && mappedBlocks.length !== 0) {
      blockValues = mappedBlocks.map((x, i) => {
        return {
          id: i,
          kind: x.kind,
          hidden: x.hidden,
          data: ''
        }
      })
    }

    if (struct && json) {
      return {
        ...json,
        // blocks: mappedBlocks,
        blockValues
      };
    } else {
      return {
        title: '',
        blockValues: [],
        blocks: [],
        image: '',
        tags: [],
        canonical: ''
      };
    }
  },

  validationSchema: () => buildSchema(),

  handleSubmit: values => {
    // do submitting things
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
    const [ mappedBlocks, setMappedBlocks ] = useState([] as BlockValue[])
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
        console.log('main json', json)
        console.log('json.blocks && json.blocks.length > 0', json.blocks && json.blocks.length > 0)
        if (json.blocks && json.blocks.length > 0) {

          const tempBlocks: any[] = json.blocks.map(async (x: PostBlock) => {
            const res = await getJsonFromIpfs<BlockValue>(x.cid)
            return res
          })

          setMappedBlocks(tempBlocks)
        }
        setJson(json);
      }).catch(err => console.log(err));
    }, [ trigger ]);

    if (!myAddress || !structOpt || jsonIsNone) {
      return <Loading />;
    }

    if (structOpt.isNone) {
      return <em>Post not found</em>;
    }

    if (!struct || !struct.created.account.eq(myAddress)) {
      return <em>You have no rights to edit this post</em>;
    }

    console.log('struct from get data', struct)
    console.log('mappedBlocks', mappedBlocks)

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
