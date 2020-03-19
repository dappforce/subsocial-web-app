import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps } from 'formik';
import * as Yup from 'yup';

import dynamic from 'next/dynamic';
import { SubmittableResult } from '@polkadot/api';
import { withCalls, withMulti, registry } from '@polkadot/react-api';
import * as DfForms from '../utils/forms';

import { createType } from '@polkadot/types';
import { Option } from '@polkadot/types/codec';
import { useMyAccount } from '../utils/MyAccountContext';

import { addJsonToIpfs, getJsonFromIpfs, removeFromIpfs } from '../utils/OffchainUtils';
import { queryBlogsToProp } from '../utils/index';
import { CommentContent, CommentUpdate } from '../types';
import BN from 'bn.js';

import SimpleMDEReact from 'react-simplemde-editor';
import { Loading } from '../utils/utils';
import { NoData } from '../utils/DataList';
import { Comment } from '@subsocial/types/interfaces/runtime'
import { TxFailedCallback } from '@polkadot/react-components/Status/types';
import { TxCallback } from '../utils/types';
const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

const buildSchema = (p: ValidationProps) => Yup.object().shape({

  body: Yup.string()
    // .min(p.minTextLen, `Your comment is too short. Minimum length is ${p.minTextLen} chars.`)
    .max(p.commentMaxLen, `Your comment is too long. Maximum length is ${p.commentMaxLen} chars.`)
    .required('Comment body is required')
});

type ValidationProps = {
  commentMaxLen: number
  // maxTextLen: number
};

type OuterProps = ValidationProps & {
  postId: BN,
  parentId?: BN,
  id?: BN,
  struct?: Comment,
  onSuccess: () => void,
  autoFocus: boolean,
  json: CommentContent,
  commentMaxLen: U32
};

type FormValues = CommentContent;

type FormProps = OuterProps & FormikProps<FormValues>;

const LabelledField = DfForms.LabelledField<FormValues>();

// const LabelledText = DfForms.LabelledText<FormValues>();

const InnerForm = (props: FormProps) => {
  const {
    postId,
    parentId,
    struct,
    values,
    errors,
    dirty,
    isValid,
    setFieldValue,
    isSubmitting,
    setSubmitting,
    resetForm,
    onSuccess,
    autoFocus = false
  } = props;

  const hasParent = parentId !== undefined;

  const {
    body
  } = values;

  const [ ipfsCid, setIpfsCid ] = useState('');

  const onSubmit = async (sendTx: () => void) => {
    if (isValid) {
      const json = { body };
      const cid = await addJsonToIpfs(json).catch(err => console.log(err)) as string;
      setIpfsCid(cid);
      sendTx();
      // window.onunload = async (e) => {
      //   e.preventDefault();
      //   await removeFromIpfs(cid).catch(err => console.log(err));
      //   return false;
      // };// Attention!!! Old code!
      // TODO unpin, when close tab
    }
  };

  const onTxFailed: TxFailedCallback = (_txResult: SubmittableResult | null) => {
    removeFromIpfs(ipfsCid).catch(err => console.log(err));
    setSubmitting(false);
  };

  const isNewRoot = !hasParent && !struct;

  const onTxSuccess: TxCallback = (_txResult: SubmittableResult) => {
    setSubmitting(false);

    if (isNewRoot) {
      resetForm();
    }
    if (onSuccess) {
      onSuccess();
    }
  };

  const buildTxParams = () => {
    if (!isValid) return [];

    if (!struct) {
      const parentCommentId = createType(registry, 'Option<u64>', parentId);// new Option(registry, CommentId, parentId);
      return [ postId, parentCommentId, ipfsCid ];
    } else if (dirty) {
      const update = new CommentUpdate(
        {
          ipfs_hash: createType(registry, 'Text', ipfsCid)
        });
      return [ struct.id, update ];
    } else {
      console.log('Nothing to update in a comment');
      return [];
    }
  };

  const form = () => (
    <Form className='ui form DfForm EditEntityForm'>
      <LabelledField name='body' {...props}>
        <Field
          component={SimpleMDEReact}
          name='body'
          value={body}
          onChange={(data: string) => setFieldValue('body', data)}
          className={`DfMdEditor ${errors['body'] && 'error'}`}
          style={{ marginTop: '1rem' }}
          option={{
            autofocus: autoFocus,
            spellChecker: false,
            toolbar: false,
            tabSize: 1,
            minHeight: '40px',
            status: false
          }}
        />
      </LabelledField>

      <LabelledField {...props}>
        <>
          <TxButton
            type='submit'
            label={!struct
              ? `Comment`
              : `Update my comment`
            }
            isDisabled={!dirty || isSubmitting}
            params={buildTxParams()}
            tx={struct
              ? 'social.updateComment'
              : 'social.createComment'
            }
            onClick={onSubmit}
            onFailed={onTxFailed}
            onSuccess={onTxSuccess}
          />
          {!isNewRoot && <Button
            type='button'
            onClick={onSuccess}
            content='Cancel'
          />}
        </>
      </LabelledField>
    </Form>);

  return form();
};

const EditForm = withFormik<OuterProps, FormValues>({

  // Transform outer props into form values
  mapPropsToValues: (props): FormValues => {
    const { struct, json } = props;

    if (struct) {
      return {
        body: json.toString()
      };
    } else {
      return {
        body: ''
      };
    }
  },

  validationSchema: (props: OuterProps) => buildSchema({
    commentMaxLen: props.commentMaxLen?.toNumber()
  }),

  handleSubmit: values => {
    // do submitting things
  }
})(InnerForm);

type LoadStructProps = OuterProps & {
  structOpt: Option<Comment>
};

type StructJson = CommentContent | undefined;


function LoadStruct (props: LoadStructProps) {
  const { state: { address: myAddress } } = useMyAccount();
  const { structOpt } = props;
  const [ json, setJson ] = useState(undefined as StructJson);
  const [ struct, setStruct ] = useState(undefined as CommentStruct);
  const [ trigger, setTrigger ] = useState(false);
  const jsonIsNone = json === undefined;

  const toggleTrigger = () => {
    json === undefined && setTrigger(!trigger);
  };

  useEffect(() => {
    if (!myAddress || !structOpt || structOpt.isNone) return toggleTrigger();

    setStruct(structOpt.unwrap());

    if (struct === undefined) return toggleTrigger();

    console.log('Loading comment JSON from IPFS');

    getJsonFromIpfs<CommentContent>(struct.ipfs_hash).then(json => {
      const content = json;
      setJson(content);
    }).catch(err => console.log(err));
  }, [ trigger ]);

  if (!myAddress || !structOpt || jsonIsNone) {
    return <Loading />;
  }

  if (structOpt.isNone) {
    return <NoData description={<span>Comment not found</span>} />;
  }

  return <EditForm {...props} struct={struct} json={json as CommentContent} />;
}

const commonQueries = [
  queryBlogsToProp('commentMaxLen', { propName: 'commentMaxLen' })
]

export const EditComment = withMulti<LoadStructProps>(
  LoadStruct,
  withCalls<OuterProps>(
    queryBlogsToProp('commentById', { paramName: 'id', propName: 'structOpt' }),
    ...commonQueries
  )
);

export const NewComment = withMulti<OuterProps>(
  EditForm,
  withCalls<OuterProps>(
    ...commonQueries
  )
);
