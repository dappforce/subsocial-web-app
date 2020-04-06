import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps } from 'formik';

import { Option } from '@polkadot/types';
import Section from '../utils/Section';
import dynamic from 'next/dynamic';
import { SubmittableResult } from '@polkadot/api';
import { withCalls, withMulti, registry } from '@polkadot/react-api';
import { ipfs } from '../utils/OffchainUtils';
import * as DfForms from '../utils/forms';
import { queryBlogsToProp } from '../utils/index';
import { getNewIdFromEvent, Loading } from '../utils/utils';
import { useMyAccount } from '../utils/MyAccountContext';
import BN from 'bn.js';
import SimpleMDEReact from 'react-simplemde-editor';
import Router from 'next/router';
import HeadMeta from '../utils/HeadMeta';
import { TxFailedCallback } from '@polkadot/react-components/Status/types';
import { TxCallback } from '../utils/types';
import { Blog } from '@subsocial/types/substrate/interfaces';
import { BlogContent } from '@subsocial/types/offchain';
import { BlogUpdate, OptionOptionText, OptionText } from '@subsocial/types/substrate/classes';

import EditableTagGroup from '../utils/EditableTagGroup';
import { withBlogIdFromUrl } from './withBlogIdFromUrl';
import { ValidationProps, buildValidationSchema } from './BlogValidation';

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

type OuterProps = ValidationProps & {
  id?: BN;
  struct?: Blog;
  json?: BlogContent;
};

type FormValues = BlogContent & {
  handle: string;
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
    handle,
    name,
    desc,
    image,
    tags,
    navTabs
  } = values;

  const goToView = (id: BN) => {
    Router.push('/blogs/' + id.toString()).catch(console.log);
  };

  const [ ipfsCid, setIpfsCid ] = useState('');

  const onSubmit = (sendTx: () => void) => {
    if (isValid) {
      const json = { name, desc, image, tags, navTabs };
      ipfs.saveBlog(json).then(cid => {
        cid && setIpfsCid(cid.toString());
        sendTx();
      }).catch(err => new Error(err));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onTxFailed: TxFailedCallback = (txResult: SubmittableResult | null) => {
    ipfs.removeContent(ipfsCid).catch(err => new Error(err));
    setSubmitting(false);
  };

  const onTxSuccess: TxCallback = (txResult: SubmittableResult) => {
    setSubmitting(false);

    const _id = id || getNewIdFromEvent(txResult);
    _id && goToView(_id);
  };

  const buildTxParams = () => {
    if (!isValid) return [];
    if (!struct) {
      return [ new OptionText(handle), ipfsCid ];
    } else {
      // TODO update only dirty values.
      const update = new BlogUpdate({
        writers: new Option(registry, 'Vec<AccountId>', (struct.writers)),
        handle: new OptionOptionText(handle),
        ipfs_hash: new OptionText(ipfsCid)
      });
      return [ struct.id, update ];
    }
  };

  const title = struct ? `Edit blog` : `New blog`;

  return (<>
    <HeadMeta title={title}/>
    <Section className='EditEntityBox' title={title}>
      <Form className='ui form DfForm EditEntityForm'>

        <LabelledText name='name' label='Blog name' placeholder='Name of your blog.' {...props} />

        <LabelledText name='handle' label='URL handle' placeholder={`You can use a-z, 0-9, dashes and underscores.`} style={{ maxWidth: '30rem' }} {...props} />

        <LabelledText name='image' label='Image URL' placeholder={`Should be a valid image Url.`} {...props} />

        <LabelledField name='desc' label='Description' {...props}>
          <Field component={SimpleMDEReact} name='desc' value={desc} onChange={(data: string) => setFieldValue('desc', data)} className={`DfMdEditor ${errors['desc'] && 'error'}`} />
        </LabelledField>

        <EditableTagGroup name='tags' label='Tags' tags={tags} {...props}/>

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
              ? 'social.updateBlog'
              : 'social.createBlog'
            }
            onClick={onSubmit}
            onFailed={onTxFailed}
            onSuccess={onTxSuccess}
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
  </>
  );
};

export const EditForm = withFormik<OuterProps, FormValues>({

  // Transform outer props into form values
  mapPropsToValues: (props): FormValues => {
    const { struct, json } = props;
    if (struct && json) {
      const handle = struct.handle.unwrapOr('').toString();
      return {
        handle,
        ...json
      };
    } else {
      return {
        handle: '',
        name: '',
        desc: '',
        image: '',
        tags: []
      };
    }
  },

  validationSchema: buildValidationSchema,

  handleSubmit: values => {
    // do submitting things
  }
})(InnerForm);

type LoadStructProps = OuterProps & {
  structOpt: Option<Blog>;
};

type StructJson = BlogContent | undefined;

type Struct = Blog | undefined;

// TODO refactor copypasta. See the same function in NavigationEditor
function LoadStruct (props: LoadStructProps) {
  const { state: { address: myAddress } } = useMyAccount();
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

    console.log('Loading blog JSON from IPFS');
    ipfs.findBlog(struct.ipfs_hash).then(json => {
      setJson(json);
    }).catch(err => console.log(err));
  }, [ trigger ]);

  if (!myAddress || !structOpt || jsonIsNone) {
    return <Loading />;
  }

  if (!struct || !struct.created.account.eq(myAddress)) {
    return <em>You have no rights to edit this blog</em>;
  }

  if (structOpt.isNone) {
    return <em>Blog not found...</em>;
  }

  return <EditForm {...props} struct={struct} json={json} />;
}

const commonSubstrateQueries = [
  queryBlogsToProp('blogMaxLen', { propName: 'blogMaxLen' }),
  queryBlogsToProp('handleMinLen', { propName: 'handleMinLen' }),
  queryBlogsToProp('handleMaxLen', { propName: 'handleMaxLen' })
]

export const NewBlog = withMulti(
  EditForm,
  withCalls<OuterProps>(
    ...commonSubstrateQueries
  )
);

export const EditBlog = withMulti(
  LoadStruct,
  withBlogIdFromUrl,
  withCalls<OuterProps>(
    queryBlogsToProp('blogById', { paramName: 'id', propName: 'structOpt' }),
    ...commonSubstrateQueries
  )
);

export default NewBlog;
