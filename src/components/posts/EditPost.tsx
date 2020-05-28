import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps } from 'formik';
import dynamic from 'next/dynamic';
import { SubmittableResult } from '@polkadot/api';
import EditableTagGroup from '../utils/EditableTagGroup'
import { withCalls, withMulti, registry } from '@subsocial/react-api';
import { useSubsocialApi } from '../utils/SubsocialApiContext'
import * as DfForms from '../utils/forms';
import { Null } from '@polkadot/types';
import { Option } from '@polkadot/types/codec';
import Section from '../utils/Section';
import { useMyAddress } from '../utils/MyAccountContext';
import { socialQueryToProp } from '../utils/index';
import { getNewIdFromEvent, Loading } from '../utils/utils';
import BN from 'bn.js';
import Router, { useRouter } from 'next/router';
import HeadMeta from '../utils/HeadMeta';
import { TxFailedCallback } from '@subsocial/react-components/Status/types';
import { TxCallback } from '../utils/types';
import { PostExtension, PostUpdate, OptionId, OptionText } from '@subsocial/types/substrate/classes';
import { Post, IpfsHash, BlogId, PostExtension as IPostExtension } from '@subsocial/types/substrate/interfaces';
import { PostContent } from '@subsocial/types/offchain';
import { newLogger } from '@subsocial/utils'
import { buildValidationSchema } from './PostValidation';
import { LabeledValue } from 'antd/lib/select';
import SelectBlogPreview from '../utils/SelectBlogPreview';
import { Icon } from 'antd';
import BloggedSectionTitle from '../blogs/BloggedSectionTitle';
import DfMdEditor from '../utils/DfMdEditor';

const log = newLogger('Edit post')
const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

type OuterProps = {
  blogId?: BN,
  id?: BN,
  extension?: IPostExtension,
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
    extension = DefaultPostExt,
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

  const isRegularPost = extension.isRegularPost

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

  const initialBlogId = blogId

  const goToView = (id: BN) => {
    Router.push(`/blogs/${currentBlogId}/posts/${id}`).catch(err => log.error('Failed redirection to post page:', err));
  };

  const { ipfs } = useSubsocialApi()
  const [ currentBlogId, setCurrentBlogId ] = useState(initialBlogId)
  const [ showAdvanced, setShowAdvanced ] = useState(false)
  const [ ipfsHash, setIpfsHash ] = useState<IpfsHash>();

  const onTxFailed: TxFailedCallback = (_txResult: SubmittableResult | null) => {
    ipfsHash && ipfs.removeContent(ipfsHash).catch(err => new Error(err));
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

  const newTxParams = (hash: IpfsHash) => {
    if (isValid || !isRegularPost) {
      if (!struct) {
        return [ currentBlogId, extension, hash ];
      } else {
        // TODO update only dirty values.
        const update = new PostUpdate(
          {
          // If we provide a new blog_id in update, it will move this post to another blog.
            blog_id: new OptionId(),
            ipfs_hash: new OptionText(hash)
          });
        return [ struct.id, update ];
      }
    } else {
      return [];
    }
  };

  const buildTxParams = async () => {
    try {
      if (isValid || !isRegularPost) {
        const json = { title, body, image, tags, canonical };
        const hash = await ipfs.savePost(json)
        if (hash) {
          setIpfsHash(hash);
          return newTxParams(hash)
        } else {
          throw new Error('Invalid hash')
        }
      }
      return []
    } catch (err) {
      log.error('Failed to build tx params: %o', err)
      return []
    }
  };

  const renderTxButton = () => (
    <TxButton
      label={!struct
        ? `Create a post`
        : `Update a post`
      }
      isDisabled={isSubmitting || (isRegularPost && !dirty)}
      params={buildTxParams}
      tx={struct
        ? 'social.updatePost'
        : 'social.createPost'
      }
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

          <LabelledField name='body' label='Post' {...props}>
            <Field component={DfMdEditor} name='body' value={body} onChange={(data: string) => setFieldValue('body', data)} className={`DfMdEditor ${errors['body'] && 'error'}`} />
          </LabelledField>

          <EditableTagGroup name='tags' label='Tags' tags={tags} {...props} />

          <div className="EPadvanced">
            <div className="EPadvacedTitle" onClick={handleAdvancedSettings}>
              {!showAdvanced ? 'Show' : 'Hide'} Advanced Settings
              <Icon type={showAdvanced ? 'up' : 'down'} />
            </div>
            {showAdvanced &&
              <LabelledText name='canonical' label='Original post URL' placeholder={`Set a URL of original post`} {...props} />
            }
          </div>
        </>
        : <>
          <DfMdEditor value={body} onChange={(data: string) => setFieldValue('body', data)} className={`DfMdEditor`}/>
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
      return <Component blogId={new BN(blogId as string)} />;
    } catch (err) {
      return <em>Invalid blog ID: {blogId}</em>;
    }
  };
}

type LoadStructProps = OuterProps & {
  structOpt: Option<Post>
};

function LoadStruct (Component: React.ComponentType<LoadStructProps>) {
  return function (props: LoadStructProps) {
    const myAddress = useMyAddress()
    const { ipfs } = useSubsocialApi()
    const { structOpt } = props;
    const [ json, setJson ] = useState<PostContent>();
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

      ipfs.findPost(struct.ipfs_hash).then(json => {
        setJson(json);
      }).catch(err => log.error('Failed to find a post in IPFS:', err));
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
  InnerEditPost
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
    socialQueryToProp('postById', { paramName: 'id', propName: 'structOpt' })
  ),
  LoadStruct,
  withCalls<OuterProps>(
    socialQueryToProp(`blogIdsByOwner`, { paramName: 'myAddress', propName: 'blogIds' })
  )
);
