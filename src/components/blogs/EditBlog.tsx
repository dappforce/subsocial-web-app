import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps } from 'formik';
import * as Yup from 'yup';

import { Option, Text } from '@polkadot/types';
import Section from '../utils/Section';
import dynamic from 'next/dynamic';
const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });
import { SubmittableResult } from '@polkadot/api';
import { withCalls, withMulti } from '@polkadot/ui-api';

import { addJsonToIpfs, getJsonFromIpfs, removeFromIpfs } from '../utils/OffchainUtils';
import * as DfForms from '../utils/forms';
import { queryBlogsToProp } from '../utils/index';
import { BlogId, Blog, BlogContent, BlogUpdate, VecAccountId } from '../types';
import { getNewIdFromEvent, Loading } from '../utils/utils';
import { useMyAccount } from '../utils/MyAccountContext';

import SimpleMDEReact from 'react-simplemde-editor';
import Router, { useRouter } from 'next/router';

// TODO get next settings from Substrate:
const SLUG_REGEX = /^[A-Za-z0-9_-]+$/;

const URL_MAX_LEN = 2000;

const SLUG_MIN_LEN = 5;
const SLUG_MAX_LEN = 50;

const NAME_MIN_LEN = 3;
const NAME_MAX_LEN = 100;
const DESC_MAX_LEN = 1000;

// const POST_TITLE_MIN_LEN = 3;
// const POST_TITLE_MAX_LEN = 100;
// const POST_BODY_MAX_LEN = 10000;

// const COMMENT_MIN_LEN = 2;
// const COMMENT_MAX_LEN = 1000;

const buildSchema = (p: ValidationProps) => Yup.object().shape({

  slug: Yup.string()
    .required('Slug is required')
    .matches(SLUG_REGEX, 'Slug can have only letters (a-z, A-Z), numbers (0-9), underscores (_) and dashes (-).')
    .min(SLUG_MIN_LEN, `Slug is too short. Minimum length is ${SLUG_MIN_LEN} chars.`)
    .max(SLUG_MAX_LEN, `Slug is too long. Maximum length is ${SLUG_MAX_LEN} chars.`),

  name: Yup.string()
    .required('Name is required')
    .min(NAME_MIN_LEN, `Name is too short. Minimum length is ${NAME_MIN_LEN} chars.`)
    .max(NAME_MAX_LEN, `Name is too long. Maximum length is ${NAME_MAX_LEN} chars.`),

  image: Yup.string()
    .url('Image must be a valid URL.')
    .max(URL_MAX_LEN, `Image URL is too long. Maximum length is ${URL_MAX_LEN} chars.`),

  desc: Yup.string()
    .max(DESC_MAX_LEN, `Description is too long. Maximum length is ${DESC_MAX_LEN} chars.`)
});

type ValidationProps = {
  // TODO get slug validation params
};

type OuterProps = ValidationProps & {
  id?: BlogId,
  struct?: Blog,
  json?: BlogContent
};

type FormValues = BlogContent & {
  slug: string
};

type FormProps = OuterProps & FormikProps<FormValues>;

const LabelledField = DfForms.LabelledField<FormValues>();

const LabelledText = DfForms.LabelledText<FormValues>();

const InnerForm = (props: FormProps) => {
  const {
    id,
    struct,
    values,
    errors,
    dirty,
    isValid,
    setFieldValue,
    isSubmitting,
    setSubmitting,
    resetForm
  } = props;

  const {
    slug,
    name,
    desc,
    image,
    tags
  } = values;

  const goToView = (id: BlogId) => {
    Router.push('/blogs/' + id.toString()).catch(console.log);
  };

  const [ ipfsCid, setIpfsCid ] = useState('');

  const onSubmit = (sendTx: () => void) => {
    if (isValid) {
      const json = { name, desc, image, tags };
      addJsonToIpfs(json).then(cid => {
        setIpfsCid(cid);
        sendTx();
      }).catch(err => new Error(err));
    }
  };

  const onTxCancelled = () => {
    removeFromIpfs(ipfsCid).catch(err => new Error(err));
    setSubmitting(false);
  };

  const onTxFailed = (_txResult: SubmittableResult) => {
    removeFromIpfs(ipfsCid).catch(err => new Error(err));
    setSubmitting(false);
  };

  const onTxSuccess = (_txResult: SubmittableResult) => {
    setSubmitting(false);

    const _id = id ? id : getNewIdFromEvent<BlogId>(_txResult);
    _id && goToView(_id);
  };

  const buildTxParams = () => {
    if (!isValid) return [];
    if (!struct) {
      return [ slug, ipfsCid ];
    } else {
      // TODO update only dirty values.
      const update = new BlogUpdate({
        // TODO get updated writers from the form
        writers: new Option(VecAccountId,(struct.writers)),
        slug: new Option(Text, slug),
        ipfs_hash: new Option(Text, ipfsCid)
      });
      return [ struct.id, update ];
    }
  };

  const title = struct ? `Edit blog` : `New blog`;

  return (
    <Section className='EditEntityBox' title={title}>
    <Form className='ui form DfForm EditEntityForm'>

      <LabelledText name='name' label='Blog name' placeholder='Name of your blog.' {...props} />

      <LabelledText name='slug' label='URL slug' placeholder={`You can use a-z, 0-9, dashes and underscores.`} style={{ maxWidth: '30rem' }} {...props} />

      <LabelledText name='image' label='Image URL' placeholder={`Should be a valid image Url.`} {...props} />

      <LabelledField name='desc' label='Description' {...props}>
        <Field component={SimpleMDEReact} name='desc' value={desc} onChange={(data: string) => setFieldValue('desc', data)} className={`DfMdEditor ${errors['desc'] && 'error'}`} />
      </LabelledField>

      {/* TODO tags */}

      <LabelledField {...props}>
        <TxButton
          type='submit'
          size='medium'
          label={struct
            ? 'Update blog'
            : 'Create new blog'
          }
          isDisabled={!dirty || isSubmitting}
          params={buildTxParams()}
          tx={struct
            ? 'blogs.updateBlog'
            : 'blogs.createBlog'
          }
          onClick={onSubmit}
          txCancelledCb={onTxCancelled}
          txFailedCb={onTxFailed}
          txSuccessCb={onTxSuccess}
        />
        <Button
          type='button'
          size='medium'
          disabled={!dirty || isSubmitting}
          onClick={() => resetForm()}
          content='Reset form'
        />
      </LabelledField>
    </Form>
    </Section>
  );
};

const EditForm = withFormik<OuterProps, FormValues>({

  // Transform outer props into form values
  mapPropsToValues: (props): FormValues => {
    const { struct, json } = props;
    if (struct && json) {
      const slug = struct.slug.toString();
      return {
        slug,
        ...json
      };
    } else {
      return {
        slug: '',
        name: '',
        desc: '',
        image: '',
        tags: []
      };
    }
  },

  validationSchema: buildSchema,

  handleSubmit: values => {
    // do submitting things
  }
})(InnerForm);

function withIdFromUrl (Component: React.ComponentType<OuterProps>) {
  return function () {
    const router = useRouter();
    const { id } = router.query;
    try {
      return <Component id={new BlogId(id as string)} />;
    } catch (err) {
      return <em>Invalid post ID: {id}</em>;
    }
  };
}

type LoadStructProps = OuterProps & {
  structOpt: Option<Blog>
};

type StructJson = BlogContent | undefined;

type Struct = Blog | undefined;

function LoadStruct (props: LoadStructProps) {

  const { state: { address: myAddress } } = useMyAccount();
  const { structOpt } = props;
  const [ json, setJson ] = useState(undefined as StructJson);
  const [ struct, setStruct ] = useState(undefined as Struct);
  const [ trigger, setTrigger ] = useState(false);
  const jsonIsNone = json === undefined;

  const toggleTrigger = () => {
    json === undefined && setTrigger(!trigger);
    return;
  };

  useEffect(() => {

    if (!myAddress || !structOpt || structOpt.isNone) return toggleTrigger();

    setStruct(structOpt.unwrap());

    if (struct === undefined) return toggleTrigger();

    console.log('Loading blog JSON from IPFS');
    getJsonFromIpfs<BlogContent>(struct.ipfs_hash).then(json => {
      setJson(json);
    }).catch(err => console.log(err));
  }, [ trigger ]);

  if (!myAddress || !structOpt || jsonIsNone) {
    return <Loading />;
  }

  if (structOpt.isNone) {
    return <em>Blog not found...</em>;
  }

  return <EditForm {...props} struct={struct} json={json} />;
}

export const NewBlog = withMulti(
  EditForm
  // , withOnlyMembers
);

export const EditBlog = withMulti(
  LoadStruct,
  withIdFromUrl,
  withCalls<OuterProps>(
    queryBlogsToProp('blogById',
      { paramName: 'id', propName: 'structOpt' })
  )
);

export default NewBlog;
