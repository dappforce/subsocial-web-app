import React, { useState } from 'react';
import { MyAccountProps } from '../utils/MyAccount';
import { useForm, Controller, ErrorMessage } from 'react-hook-form';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { IpfsHash } from '@subsocial/types/substrate/interfaces';
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton';
import SimpleMDEReact from 'react-simplemde-editor';
import { buildSharePostValidationSchema } from '../posts/PostValidation'
import { CommentContent } from '@subsocial/types';
import { Button } from 'antd';
import { fakeClientId } from '../utils';
import { CommentTxButtonType } from './utils';
import { getNewIdFromEvent } from '../substrate';
import BN from 'bn.js'

type Props = MyAccountProps & {
  content?: CommentContent,
  withCancel?: boolean,
  callback?: (id?: BN) => void,
  CommentTxButton: (props: CommentTxButtonType) => JSX.Element
};

const Fields = {
  body: 'body'
}

export const InnerEditComment = (props: Props) => {

  const { content, withCancel = false, callback, CommentTxButton } = props;
  const { ipfs } = useSubsocialApi()
  const [ ipfsHash, setIpfsHash ] = useState<IpfsHash>();
  const [ fakeId ] = useState(fakeClientId())

  const { control, errors, formState, watch, reset } = useForm({
    validationSchema: buildSharePostValidationSchema(),
    reValidateMode: 'onBlur',
    mode: 'onBlur'
  });

  const body = watch(Fields.body, content?.body || '');

  const { isSubmitting, dirty } = formState;

  const resetForm = () => {
    reset({ [Fields.body]: '' })
  }

  const onCancel = () => {
    callback && callback()
    resetForm()
  }

  const onTxFailed: TxFailedCallback = () => {
    ipfsHash && ipfs.removeContent(ipfsHash).catch(err => new Error(err));
    callback && callback()
  };

  const onTxSuccess: TxCallback = (txResult) => {
    const id = getNewIdFromEvent(txResult)
    callback && callback(id)
    resetForm()
  };

  const renderTxButton = () => (
    <CommentTxButton
      ipfs={ipfs}
      setIpfsHash={setIpfsHash}
      json={{ body }}
      fakeId={fakeId}
      disabled={isSubmitting || !dirty}
      onFailed={onTxFailed}
      onSuccess={onTxSuccess}
    />
  );

  return <div className='DfShareModalBody'>
    <form>
      <Controller
        as={<SimpleMDEReact />}
        name={Fields.body}
        control={control}
        value={body}
        defaultValue={body}
        className={`DfMdEditor ${errors[Fields.body] && 'error'}`}
      />
      <div className='DfError'>
        <ErrorMessage errors={errors} name={Fields.body} />
      </div>
    </form>
    <div className='DfActionButtonsBlock'>
      {renderTxButton()}
      {withCancel && <Button type='link' onClick={onCancel} className="DfGreyLink">Cancel</Button>}
    </div>
  </div>
};

export default InnerEditComment
