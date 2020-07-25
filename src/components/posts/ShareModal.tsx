import React, { useState } from 'react';
import { withCalls, withMulti, getTxParams, spacesQueryToProp } from '../substrate';
import { Modal } from 'antd';
import Button from 'antd/lib/button';
import { withMyAccount, MyAccountProps } from '../utils/MyAccount';
import Link from 'next/link';
import { LabeledValue } from 'antd/lib/select';
import SelectSpacePreview from '../utils/SelectSpacePreview';
import BN from 'bn.js';
import { PostExtension, SharedPost } from '@subsocial/types/substrate/classes';
import { useForm, Controller, ErrorMessage } from 'react-hook-form';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { IpfsHash } from '@subsocial/types/substrate/interfaces';
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton';
import dynamic from 'next/dynamic';
import { buildSharePostValidationSchema } from './PostValidation';
import { isEmptyArray } from '@subsocial/utils';
import DfMdEditor from '../utils/DfMdEditor';
import { DynamicPostPreview } from './view-post/DynamicPostPreview';

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

type Props = MyAccountProps & {
  postId: BN
  spaceIds?: BN[]
  open: boolean
  onClose: () => void
}

const Fields = {
  body: 'body'
}

const InnerShareModal = (props: Props) => {
  const { open, onClose, postId, spaceIds } = props;

  if (!spaceIds) {
    return null
  }

  const extension = new PostExtension({ SharedPost: postId as SharedPost });

  const { ipfs } = useSubsocialApi()
  const [ ipfsHash, setIpfsHash ] = useState<IpfsHash>();
  const [ spaceId, setSpaceId ] = useState(spaceIds[0]);

  const { control, errors, formState, watch } = useForm({
    validationSchema: buildSharePostValidationSchema(),
    reValidateMode: 'onBlur',
    mode: 'onBlur'
  });

  const body = watch(Fields.body, '');
  const { isSubmitting } = formState;

  const onTxFailed: TxFailedCallback = () => {
    ipfsHash && ipfs.removeContent(ipfsHash).catch(err => new Error(err));
    // TODO show a failure message
    onClose()
  };

  const onTxSuccess: TxCallback = () => {
    // TODO show a success message
    onClose()
  };

  const newTxParams = (hash: IpfsHash) => {
    return [ spaceId, extension, hash ];
  };

  const renderTxButton = () =>
    <TxButton
      type='primary'
      label={`Create a post`}
      disabled={isSubmitting}
      params={() => getTxParams({
        json: { body },
        buildTxParamsCallback: newTxParams,
        setIpfsHash,
        ipfs
      })}
      tx={'posts.createPost'}
      onFailed={onTxFailed}
      onSuccess={onTxSuccess}
      successMessage='Shared to your space'
      failedMessage='Failed to share'
    />

  const renderShareView = () => {
    if (isEmptyArray(spaceIds)) {
      return (
        <Link href='/spaces/new'>
          <a className='ui button primary'>
            Create your first space
          </a>
        </Link>
      )
    }

    return <div className='DfShareModalBody'>
      <span className='mr-3'>
        Share the post to your space:
        {' '}
        <SelectSpacePreview
          spaceIds={spaceIds}
          onSelect={saveSpace}
          imageSize={24}
          defaultValue={spaceId?.toString()}
        />
      </span>

      <form className='my-2'>
        <Controller
          as={<DfMdEditor />}
          name={Fields.body}
          control={control}
          value={body}
          className={errors[Fields.body] && 'error'}
        />
        <div className='DfError'>
          <ErrorMessage errors={errors} name={Fields.body} />
        </div>
      </form>
      <DynamicPostPreview id={postId} asRegularPost />
    </div>
  };

  const saveSpace = (value: string | number | LabeledValue) => {
    setSpaceId(new BN(value as string));
  };

  return <Modal
    onCancel={onClose}
    visible={open}
    title={'Share post'}
    style={{ marginTop: '3rem' }}
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

export const ShareModal = withMulti(
  InnerShareModal,
  withMyAccount,
  withCalls<Props>(
    spacesQueryToProp(`spaceIdsByOwner`, { paramName: 'address', propName: 'spaceIds' })
  )
);
