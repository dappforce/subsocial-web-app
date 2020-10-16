import React, { useState } from 'react';
import { MyAccountProps } from '../utils/MyAccount';
import { useForm, Controller, ErrorMessage } from 'react-hook-form';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { IpfsCid } from '@subsocial/types/substrate/interfaces';
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton';
import DfMdEditor from '../utils/DfMdEditor';
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
  CommentTxButton: (props: CommentTxButtonType) => JSX.Element,
  withStub?: boolean
};

const Fields = {
  body: 'body'
}

export const InnerEditComment = (props: Props) => {
  const { content, withCancel = false, callback, CommentTxButton, withStub } = props;
  const { ipfs } = useSubsocialApi()
  const [ IpfsCid, setIpfsCid ] = useState<IpfsCid>();
  const [ fakeId ] = useState(fakeClientId())
  const [ toolbar, setToolbar ] = useState(!withStub)

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
    IpfsCid && ipfs.removeContent(IpfsCid).catch(err => new Error(err));
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
      setIpfsCid={setIpfsCid}
      json={{ body }}
      fakeId={fakeId}
      disabled={isSubmitting || !dirty}
      onFailed={onTxFailed}
      onSuccess={onTxSuccess}
    />
  );

  return <div className='DfShareModalBody'>
    <form onClick={() => setToolbar(true)}>
      <Controller
        control={control}
        as={<DfMdEditor options={{ placeholder: 'Write a comment...', toolbar, autofocus: toolbar }} />}
        name={Fields.body}
        value={body}
        defaultValue={body}
        className={errors[Fields.body] && 'error'}
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
