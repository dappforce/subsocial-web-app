import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps } from 'formik';
import dynamic from 'next/dynamic';
import { SubmittableResult } from '@polkadot/api';
import EditableTagGroup from '../utils/EditableTagGroup'
import { withCalls, withMulti, registry } from '@polkadot/react-api';

import { ipfs } from '../utils/OffchainUtils';
import * as DfForms from '../utils/forms';
import { Null } from '@polkadot/types';
import { Option, Enum } from '@polkadot/types/codec';
import Section from '../utils/Section';
import { useMyAccount } from '../utils/MyAccountContext';
import { queryBlogsToProp } from '../utils/index';
import { getNewIdFromEvent, Loading } from '../utils/utils';
import BN from 'bn.js';
import SimpleMDEReact from 'react-simplemde-editor';
import Router, { useRouter } from 'next/router';
import HeadMeta from '../utils/HeadMeta';
import { TxFailedCallback } from '@polkadot/react-components/Status/types';
import { TxCallback } from '../utils/types';
import { PostExtension, PostUpdate } from '@subsocial/types/substrate/classes';
import { Post, IpfsHash, BlogId } from '@subsocial/types/substrate/interfaces';
import { PostContent } from '@subsocial/types/offchain';
import { ValidationProps, buildValidationSchema } from './PostValidation';
import { LabeledValue } from 'antd/lib/select';
import SelectBlogPreview from '../utils/SelectBlogPreview';
import { Icon } from 'antd';
import BloggedSectionTitle from '../blogs/BloggedSectionTitle';
const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });


type OuterProps = ValidationProps & {
  blogId?: BN,
  id?: BN,
  extention?: Enum,
  struct?: Post
  json?: PostContent,
  onlyTxButton?: boolean,
  closeModal?: () => void,
  withButtons?: boolean,
  myAddress?: string,
  blogIds?: BlogId[]
};

const DefaultPostExt = new PostExtension({ RegularPost: new Null(registry) })

type FormValues = PostContent;

type FormProps = OuterProps & FormikProps<FormValues>;

const LabelledField = DfForms.LabelledField<FormValues>();

const LabelledText = DfForms.LabelledText<FormValues>();

const InnerForm = (props: FormProps) => {
  const {
    id,
    blogId,
    struct,
    extention = DefaultPostExt,
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

  // console.log(extention.value);
  const isRegularPost = extention.value.isEmpty; // TODO maybe fix after run UI

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

  const initialBlogId = struct?.blog_id || blogId

  const goToView = (id: BN) => {
    Router.push(`/blogs/${preparedBlogId}/posts/${id}`).catch(console.log);
  };

  const [ currentBlogId, setCurrentBlogId ] = useState(initialBlogId)
  const [ showAdvanced, setShowAdvanced ] = useState(false)
  const [ ipfsHash, setIpfsCid ] = useState<IpfsHash>();

  const preparedBlogId = currentBlogId

  const onSubmit = (sendTx: () => void) => {
    if (isValid || !isRegularPost) {
      const json = { title, body, image, tags, canonical };
      ipfs.savePost(json).then(hash => {
        setIpfsCid(hash);
        sendTx();
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

  const handleAdvancedSettings = () => {
    setShowAdvanced(!showAdvanced)
  }

  const buildTxParams = () => {
    if (isValid || !isRegularPost) {
      if (!struct) {
        return [ blogId, ipfsHash, extention ];
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

  const form =
    <Form className='ui form DfForm EditEntityForm'>

      {isRegularPost
        ? <>
          {renderBlogsPreviewDropdown()}
          <LabelledText name='title' label='Post title' placeholder={`What is a title of you post?`} {...props} />

          <LabelledText name='image' label='Image URL' placeholder={`Should be a valid image URL.`} {...props} />

          {/* TODO ask a post summary or auto-generate and show under an "Advanced" tab. */}
          <EditableTagGroup name='tags' label='Tags' tags={tags} {...props} />

          <LabelledField name='body' label='Description' {...props}>
            <Field component={SimpleMDEReact} name='body' value={body} onChange={(data: string) => setFieldValue('body', data)} className={`DfMdEditor ${errors['body'] && 'error'}`} />
          </LabelledField>

          <div className="EPadvanced">
            <div className="EPadvacedTitle" onClick={handleAdvancedSettings}>
              {!showAdvanced ? 'Show' : 'Hide'} Advanced Settings
              <Icon type={showAdvanced ? 'up' : 'down'} />
            </div>
            {showAdvanced &&
              <LabelledText name='canonical' label='Canonical URL' placeholder={`Set a canonical URL of your post`} {...props} />
            }
          </div>
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

  const pageTitle = isRegularPost ? (!struct ? `New post` : `Edit my post`) : 'Share post';

  const sectionTitle = currentBlogId && <BloggedSectionTitle blogId={currentBlogId} title={pageTitle} />

  const editRegularPost = () =>
    <Section className='EditEntityBox' title={sectionTitle}>
      {form}
    </Section>

  const editSharedPost = () =>
    <div style={{ marginTop: '1rem' }}>{form}</div>

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

  validationSchema: buildValidationSchema,

  handleSubmit: () => {
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
      return <Component id={new BN(postId as string)} {...props}/>;
    } catch (err) {
      return <em>Invalid post ID: {postId}</em>;
    }
  };
}

function withBlogIdFromUrl (Component: React.ComponentType<OuterProps>) {
  return function () {
    const router = useRouter();
    const { blogId } = router.query;
    try {
      return <Component blogId={new BN(blogId as string)} postMaxLen={1000} />;
    } catch (err) {
      return <em>Invalid blog ID: {blogId}</em>;
    }
  };
}

type LoadStructProps = OuterProps & {
  structOpt: Option<Post>
};

type StructJson = PostContent | undefined;

function LoadStruct (Component: React.ComponentType<LoadStructProps>) {
  return function (props: LoadStructProps) {
    const { state: { address: myAddress } } = useMyAccount(); // TODO maybe remove, because useless
    const { structOpt } = props;
    const [ json, setJson ] = useState(undefined as StructJson);
    const [ struct, setStruct ] = useState<Post>();
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

      ipfs.findPost(struct.ipfs_hash).then(json => {
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
