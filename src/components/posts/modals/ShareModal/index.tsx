import React, { useState } from 'react';
import { withCalls, withMulti, getTxParams, spacesQueryToProp } from 'src/components/substrate';
import { Modal } from 'antd';
import Button from 'antd/lib/button';
import { withMyAccount, MyAccountProps } from 'src/components/utils/MyAccount';
import { LabeledValue } from 'antd/lib/select';
import SelectSpacePreview from 'src/components/utils/SelectSpacePreview';
import BN from 'bn.js';
import { PostExtension, SharedPost, IpfsContent } from '@subsocial/types/substrate/classes';
import { useForm, Controller, ErrorMessage } from 'react-hook-form';
import { useSubsocialApi } from 'src/components/utils/SubsocialApiContext';
import { IpfsCid } from '@subsocial/types/substrate/interfaces';
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton';
import dynamic from 'next/dynamic';
import { buildSharePostValidationSchema } from 'src/components/posts/PostValidation';
import { isEmptyArray } from '@subsocial/utils';
import DfMdEditor from 'src/components/utils/DfMdEditor';
import { DynamicPostPreview } from 'src/components/posts/view-post/DynamicPostPreview';
import { CreateSpaceButton } from 'src/components/spaces/helpers';
import styles from './index.module.sass'

const TxButton = dynamic(() => import('src/components/utils/TxButton'), { ssr: false });

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
  const [ IpfsCid, setIpfsCid ] = useState<IpfsCid>();
  const [ spaceId, setSpaceId ] = useState(spaceIds[0]);

  const { control, errors, formState, watch } = useForm({
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

  const newTxParams = (hash: IpfsCid) => {
    return [ spaceId, extension, new IpfsContent(hash) ];
  };

  const renderTxButton = () =>
    <TxButton
      type='primary'
      label={`Create a post`}
      disabled={isSubmitting}
      params={() => getTxParams({
        json: { body },
        buildTxParamsCallback: newTxParams,
        setIpfsCid,
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
        <CreateSpaceButton>
          <a className='ui button primary'>
            Create my first space
          </a>
        </CreateSpaceButton>
      )
    }

    return <div className={'DfPostActionModalBody'}>
      <span className={'DfPostActionModalSelector'}>
        <SelectSpacePreview
          spaceIds={spaceIds || []}
          onSelect={saveSpace}
          imageSize={24}
          defaultValue={spaceId?.toString()}
        />
      </span>

      <form style={{margin: '0.75rem 0'}}>
        <Controller
          control={control}
          as={<DfMdEditor />}
          options={{ autofocus: true }}
          name={Fields.body}
          value={body}
          className={`${errors[Fields.body] && 'error'} ${styles.DfShareModalMdEditor}`}
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
    className={'DfPostActionModal'}
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
