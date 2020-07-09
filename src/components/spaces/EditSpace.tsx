import React, { useState, useEffect } from 'react';
import Button from 'antd/lib/button';
import { Form, Field, withFormik, FormikProps } from 'formik';

import { Option } from '@polkadot/types';
import Section from '../utils/Section';
import dynamic from 'next/dynamic';
import { SubmittableResult } from '@polkadot/api';
import { withCalls, withMulti } from '../substrate';
import * as DfForms from '../utils/forms';
import { spacesQueryToProp } from '../utils/index';
import { getNewIdFromEvent, Loading } from '../utils';
import { useMyAddress } from '../auth/MyAccountContext';
import BN from 'bn.js';
import Router from 'next/router';
import HeadMeta from '../utils/HeadMeta';
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton';
import { Space, IpfsHash } from '@subsocial/types/substrate/interfaces';
import { SpaceContent } from '@subsocial/types/offchain';
import { SpaceUpdate, OptionOptionText, OptionText, OptionBool } from '@subsocial/types/substrate/classes';
import { newLogger } from '@subsocial/utils'
import { useSubsocialApi } from '../utils/SubsocialApiContext';

import EditableTagGroup from '../utils/EditableTagGroup';
import { withSpaceIdFromUrl } from './withSpaceIdFromUrl';
import { ValidationProps, buildValidationSchema } from './SpaceValidation';
import DfMdEditor from '../utils/DfMdEditor';
import { getTxParams } from '../utils/substrate/getTxParams';

const log = newLogger('Edit space')
const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

type OuterProps = ValidationProps & {
  id?: BN;
  struct?: Space;
  json?: SpaceContent;
};

type FormValues = SpaceContent & {
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
  const { ipfs } = useSubsocialApi()

  const goToView = (id: BN) => {
    Router.push('/spaces/' + id.toString()).catch(err => log.error('Failed to redirect to space page. Error:', err));
  };

  const [ ipfsHash, setIpfsHash ] = useState<IpfsHash>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onTxFailed: TxFailedCallback = (txResult: SubmittableResult | null) => {
    ipfsHash && ipfs.removeContent(ipfsHash).catch(err => new Error(err));
    setSubmitting(false);
  };

  const onTxSuccess: TxCallback = (txResult: SubmittableResult) => {
    setSubmitting(false);

    const _id = id || getNewIdFromEvent(txResult);
    _id && goToView(_id);
  };

  const newTxParams = (hash: IpfsHash) => {
    if (!isValid) return [];
    if (!struct) {
      return [ new OptionText(handle), hash ];
    } else {
      // TODO update only dirty values.
      const update = new SpaceUpdate({
        handle: new OptionOptionText(handle),
        ipfs_hash: new OptionText(hash),
        hidden: new OptionBool(false) // TODO has no implementation on UI
      });
      return [ struct.id, update ];
    }
  };

  const title = struct ? `Edit space` : `New space`;

  return <>
    <HeadMeta title={title}/>
    <Section className='EditEntityBox' title={title}>
      <Form className='ui form DfForm EditEntityForm'>

        <LabelledText name='name' label='Space name' placeholder='Name of your space.' {...props} />

        <LabelledText name='handle' label='URL handle' placeholder={`You can use a-z, 0-9 and underscores.`} style={{ maxWidth: '30rem' }} {...props} />

        <LabelledText name='image' label='Image URL' placeholder={`Should be a valid image Url.`} {...props} />

        <LabelledField name='desc' label='Description' {...props}>
          <Field component={DfMdEditor} name='desc' value={desc} onChange={(data: string) => setFieldValue('desc', data)} className={`DfMdEditor ${errors['desc'] && 'error'}`} />
        </LabelledField>

        <EditableTagGroup name='tags' label='Tags' tags={tags} {...props}/>

        <LabelledField {...props}>
          <TxButton
            type='primary'
            label={struct
              ? 'Update space'
              : 'Create new space'
            }
            disabled={!dirty || isSubmitting}
            params={() => getTxParams({
              json: { name, desc, image, tags, navTabs },
              buildTxParamsCallback: newTxParams,
              setIpfsHash,
              ipfs
            })}
            tx={struct
              ? 'spaces.updateSpace'
              : 'spaces.createSpace'
            }
            onFailed={onTxFailed}
            onSuccess={onTxSuccess}
          />
          <Button
            disabled={!dirty}
            onClick={() => resetForm()}
          >Reset form</Button>
        </LabelledField>
      </Form>
    </Section>
  </>
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
  structOpt: Option<Space>;
};

// TODO refactor copypasta. See the same function in NavigationEditor
function LoadStruct (props: LoadStructProps) {
  const myAddress = useMyAddress()
  const { ipfs } = useSubsocialApi()
  const { structOpt } = props;
  const [ json, setJson ] = useState<SpaceContent>();
  const [ struct, setStruct ] = useState<Space>();
  const [ trigger, setTrigger ] = useState(false);
  const jsonIsNone = json === undefined;

  const toggleTrigger = () => {
    json === undefined && setTrigger(!trigger);
  };

  useEffect(() => {
    if (!myAddress || !structOpt || structOpt.isNone) return toggleTrigger();

    setStruct(structOpt.unwrap());

    if (struct === undefined) return toggleTrigger();

    ipfs.findSpace(struct.ipfs_hash.toString()).then(json => {
      setJson(json);
    }).catch(err => log.error('Failed to find space in IPFS. Error:', err));
  }, [ trigger ]);

  if (!myAddress || !structOpt || jsonIsNone) {
    return <Loading />;
  }

  if (!struct || !struct.owner.eq(myAddress)) {
    return <em>You have no rights to edit this space</em>;
  }

  if (structOpt.isNone) {
    return <em>Space not found...</em>;
  }

  return <EditForm {...props} struct={struct} json={json} />;
}

const commonSubstrateQueries = [
  spacesQueryToProp('minHandleLen', { propName: 'handleMinLen' }),
  spacesQueryToProp('maxHandleLen', { propName: 'handleMaxLen' })
]

export const NewSpace = withMulti(
  EditForm,
  withCalls<OuterProps>(
    ...commonSubstrateQueries
  )
);

export const EditSpace = withMulti(
  LoadStruct,
  withSpaceIdFromUrl,
  withCalls<OuterProps>(
    spacesQueryToProp('spaceById', { paramName: 'id', propName: 'structOpt' }),
    ...commonSubstrateQueries
  )
);

export default NewSpace;
