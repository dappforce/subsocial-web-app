import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps } from 'formik';
import * as Yup from 'yup';
import dynamic from 'next/dynamic';
import { SubmittableResult } from '@polkadot/api';
import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { addJsonToIpfs, getJsonFromIpfs } from '../utils/OffchainUtils';
import * as DfForms from '../utils/forms';
import { Text, U32 } from '@polkadot/types';
import { Option } from '@polkadot/types/codec';
import { PostId, Post, PostContent, PostUpdate, BlogId, PostExtension, RegularPost } from '../types';
import Section from '../utils/Section';
import { useMyAccount } from '../utils/MyAccountContext';
import { queryBlogsToProp } from '../utils/index';
import { getNewIdFromEvent, Loading } from '../utils/utils';
import SimpleMDEReact from 'react-simplemde-editor';
import Router, { useRouter } from 'next/router';
import HeadMeta from '../utils/HeadMeta';
import SelectBlogPreview from '../utils/SelectBlogPreview'
import { LabeledValue } from 'antd/lib/select';
const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

const { Panel } = Collapse;

const buildSchema = (p: ValidationProps) => Yup.object().shape({
  title: Yup.string()
    // .min(p.minTitleLen, `Title is too short. Minimum length is ${p.minTitleLen} chars.`)
    // .max(p.maxTitleLen, `Title is too long. Maximum length is ${p.maxTitleLen} chars.`)
    .required('Post title is required'),

  body: Yup.string()
    // .min(p.minTextLen, `Your post is too short. Minimum length is ${p.minTextLen} chars.`)
    .max(p.postMaxLen.toNumber(), `Your post description is too long. Maximum length is ${p.postMaxLen} chars.`)
    .required('Post body is required'),

  image: Yup.string()
    .url('Image must be a valid URL.')
    // .max(URL_MAX_LEN, `Image URL is too long. Maximum length is ${URL_MAX_LEN} chars.`),
});

type ValidationProps = {
  // postMaxLen: number,
  postMaxLen: U32
};

type OuterProps = ValidationProps & {
  blogId?: BlogId,
  id?: PostId,
  extention?: PostExtension,
  struct?: Post
  json?: PostContent,
  onlyTxButton?: boolean,
  closeModal?: () => void,
  withButtons?: boolean,
  postMaxLen: U32,
  myAddress?: string,
  blogIds?: BlogId[]
};

type FormValues = PostContent;

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
    errors,
    setFieldValue,
    isSubmitting,
    setSubmitting,
    resetForm,
    onlyTxButton = false,
    withButtons = true,
    closeModal,
    blogIds
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
    body,
    image,
    tags,
    canonical
  } = values;

  const initialBlogId: BlogId = struct?.blog_id || blogId as BlogId
  const goToView = (id: PostId) => {
    Router.push(`/blogs/${preparedBlogId}/posts/${id}`).catch(console.log);
  };

  const [ ipfsHash, setIpfsCid ] = useState('');
  const [ currentBlogId, setCurrentBlogId ] = useState<BlogId>(initialBlogId)

  const preparedBlogId = currentBlogId?.toString()

  const onSubmit = (sendTx: () => void) => {
    if (isValid || !isRegularPost) {
      const json = { title, body, image, tags, canonical };
      addJsonToIpfs(json).then(hash => {
        setIpfsCid(hash);
        sendTx();
      }).catch(err => new Error(err));
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

  const handleBlogSelect = (value: string|number|LabeledValue) => {
    console.log('value', value)
    if (!value) return;

    setCurrentBlogId(new BlogId(value as string))
  };

  const renderBlogsPreviewDropdown = () => {
    if (!blogIds) return;

    return <SelectBlogPreview
      blogIds={blogIds}
      onSelect={handleBlogSelect}
      imageSize={24}
      defaultValue={currentBlogId.toString()} />
  }

  const form =
    <Form className='ui form DfForm EditEntityForm'>

      {isRegularPost
        ? <>
          {renderBlogsPreviewDropdown()}
          <LabelledText name='title' label='Post title' placeholder={`What is a title of you post?`} {...props} />

          <LabelledText name='image' label='Image URL' placeholder={`Should be a valid image URL.`} {...props} />

          {/* TODO ask a post summary or auto-generate and show under an "Advanced" tab. */}

          <LabelledField name='body' label='Description' {...props}>
            <Field component={SimpleMDEReact} name='body' value={body} onChange={(data: string) => setFieldValue('body', data)} className={`DfMdEditor ${errors['body'] && 'error'}`} />
          </LabelledField>

          <Collapse className={'EditPostCollapse'}>
            <Panel header="Show Advanced Settings" key="1">
              <LabelledText name='canonical' label='Canonical URL' placeholder={`Set canonical URL of your post`} {...props} />
            </Panel>
          </Collapse>
        </>
        : <>
          <SimpleMDEReact value={body} onChange={(data: string) => setFieldValue('body', data)} className={`DfMdEditor`}/>
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
      {isRegularPost
        ? editRegularPost()
        : editSharedPost()
      }
    </>;
};

export const InnerEditPost = withFormik<OuterProps, FormValues>({

  // Transform outer props into form values
  mapPropsToValues: (props): FormValues => {
    const { struct, json } = props;

    if (struct && json) {
      return {
        ...json
      };
    } else {
      return {
        title: '',
        body: '',
        image: '',
        tags: [],
        canonical: ''
      };
    }
  },

  validationSchema: (props: OuterProps) => buildSchema({
    postMaxLen: props.postMaxLen
  }),

  handleSubmit: values => {
    // do submitting things
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
    const { state: { address: myAddress } } = useMyAccount(); // TODO maybe remove, becose usles
    const { structOpt } = props;
    const [ json, setJson ] = useState(undefined as StructJson);
    const [ struct, setStruct ] = useState(undefined as Struct);
    const [ trigger, setTrigger ] = useState(false);
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

    return <Component {...props} struct={struct} json={json} myAddress={myAddress} />;
  };
}

export const InnerFormWithValidation = withMulti(
  InnerEditPost,
  withCalls<OuterProps>(
    queryBlogsToProp('postMaxLen', { propName: 'postMaxLen' })
  )
);

export const NewPost = withMulti(
  InnerFormWithValidation,
  withBlogIdFromUrl
);

export const NewSharePost = InnerFormWithValidation;

export const EditPost = withMulti<OuterProps>(
  InnerFormWithValidation,
  withIdFromUrl,
  withCalls<OuterProps>(
    queryBlogsToProp('postById', { paramName: 'id', propName: 'structOpt' })
  ),
  LoadStruct,
  withCalls<OuterProps>(
    queryBlogsToProp(`blogIdsByOwner`, { paramName: 'myAddress', propName: 'blogIds' })
  )
);
