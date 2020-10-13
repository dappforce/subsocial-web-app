import React, { useState } from 'react';
import { withCalls, withMulti, getTxParams, spacesQueryToProp } from '../../substrate';
import { Modal } from 'antd';
import Button from 'antd/lib/button';
import { withMyAccount, MyAccountProps } from '../../utils/MyAccount';
import { LabeledValue } from 'antd/lib/select';
import SelectSpacePreview from '../../utils/SelectSpacePreview';
import BN from 'bn.js';
import { PostExtension, SharedPost, IpfsContent, OptionId } from '@subsocial/types/substrate/classes';
import { useForm } from 'react-hook-form';
import { useSubsocialApi } from '../../utils/SubsocialApiContext';
import { IpfsCid } from '@subsocial/types/substrate/interfaces';
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton';
import dynamic from 'next/dynamic';
import { buildSharePostValidationSchema } from '../PostValidation';
import { isEmptyArray } from '@subsocial/utils';
import { DynamicPostPreview } from '../view-post/DynamicPostPreview';
import { CreateSpaceButton } from '../../spaces/helpers';
import styles from './index.module.sass'

const TxButton = dynamic(() => import('../../utils/TxButton'), { ssr: false });

type Props = MyAccountProps & {
  postId: BN
  spaceIds?: BN[]
  open: boolean
  onClose: () => void
}

const Fields = {
  body: 'body'
}

const InnerMoveModal = (props: Props) => {
  const { open, onClose, postId, spaceIds } = props;

  if (!spaceIds) {
    return null
  }

  const { ipfs } = useSubsocialApi()
  const [ IpfsCid, setIpfsCid ] = useState<IpfsCid>();
  const [ spaceId, setSpaceId ] = useState(spaceIds[0]);

  const { formState, watch } = useForm({
    validationSchema: buildSharePostValidationSchema(),
    reValidateMode: 'onBlur',
    mode: 'onBlur'
  });

  const body = watch(Fields.body, '');
  const { isSubmitting } = formState;

  const onTxFailed: TxFailedCallback = () => {
    IpfsCid && ipfs.removeContent(IpfsCid).catch(err => new Error(err));
    // TODO show a failure message
    onClose()
  };

  const onTxSuccess: TxCallback = () => {
    // TODO show a success message
    onClose()
  };

  const newTxParams = () => {
    const spaceIdOption = new OptionId(spaceId)
    return [ postId, spaceIdOption ];
  };

  const renderTxButton = () =>
    <TxButton
      type='primary'
      label={`Move`}
      disabled={isSubmitting}
      params={() => getTxParams({
        json: { body },
        buildTxParamsCallback: newTxParams,
        setIpfsCid,
        ipfs
      })}
      tx={'posts.movePost'}
      onFailed={onTxFailed}
      onSuccess={onTxSuccess}
      successMessage='Moved to another space'
      failedMessage='Failed to move'
    />

  const renderShareView = () => {
    if (isEmptyArray(spaceIds)) {
      return (
        <CreateSpaceButton>
          <a className='ui button primary'>
            Create my first space
          </a>
        </CreateSpaceButton>
      )
    }

    return <div className='DfShareModalBody'>
      <span className='mr-3'>
        Select space:
        {' '}
        <SelectSpacePreview
          spaceIds={spaceIds}
          onSelect={saveSpace}
          imageSize={24}
          defaultValue={spaceId?.toString()}
        />
      </span>
      <div className='mx-3'>
        <DynamicPostPreview id={postId} asRegularPost />
      </div>
    </div>
  };

  const saveSpace = (value: string | number | LabeledValue) => {
    setSpaceId(new BN(value as string));
  };

  return <Modal
    onCancel={onClose}
    visible={open}
    title={'Move post'}
    className={styles.DfShareModal}
    footer={
      <>
        <Button onClick={onClose}>Cancel</Button>
        {renderTxButton()}
      </>
    }
  >
    {renderShareView()}
  </Modal>
}

export const MoveModal = withMulti(
  InnerMoveModal,
  withMyAccount,
  withCalls<Props>(
    spacesQueryToProp(`spaceIdsByOwner`, { paramName: 'address', propName: 'spaceIds' })
  )
);
