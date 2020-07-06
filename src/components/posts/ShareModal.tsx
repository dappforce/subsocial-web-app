import React, { useState } from 'react';
import { withCalls, withMulti } from '../substrate';
import { getTxParams, spacesQueryToProp } from '../utils/index';
import { Modal } from 'semantic-ui-react';
import Button from 'antd/lib/button';
import { withMyAccount, MyAccountProps } from '../utils/MyAccount';
import Link from 'next/link';
import { Loading } from '../utils/utils';
import { LabeledValue } from 'antd/lib/select';
import SelectSpacePreview from '../utils/SelectSpacePreview';
import BN from 'bn.js';
import { PostExtension, SharedPost } from '@subsocial/types/substrate/classes';
import { useForm, Controller, ErrorMessage } from 'react-hook-form';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { IpfsHash } from '@subsocial/types/substrate/interfaces';
import { TxFailedCallback, TxCallback } from '@subsocial/react-components/Status/types';
import { SubmittableResult } from '@polkadot/api';
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
  close: () => void
}

const Fields = {
  body: 'body'
}

const InnerShareModal = (props: Props) => {
  const { open, close, postId, spaceIds } = props;

  const renderModal = (children: React.ReactElement) =>
    <Modal
      onClose={close}
      open={open}
      size='small'
      style={{ marginTop: '3rem' }}
    >
      {children}
    </Modal>

  if (!spaceIds) {
    return renderModal(
      <div className='p-4 text-center'>
        <Loading />
      </div>
    )
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

  const onTxFailed: TxFailedCallback = (_txResult: SubmittableResult | null) => {
    ipfsHash && ipfs.removeContent(ipfsHash).catch(err => new Error(err));
    // TODO show a failure message
    close()
  };

  const onTxSuccess: TxCallback = (_txResult: SubmittableResult) => {
    // TODO show a success message
    close()
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
      <form>
        <Controller
          as={<DfMdEditor />}
          name={Fields.body}
          control={control}
          value={body}
          className={`DfMdEditor ${errors[Fields.body] && 'error'}`}
        />
        <div className='DfError'>
          <ErrorMessage errors={errors} name={Fields.body} />
        </div>
      </form>
      <DynamicPostPreview id={postId} withActions asRegularPost/>
    </div>
  };

  const saveSpace = (value: string | number | LabeledValue) => {
    setSpaceId(new BN(value as string));
  };

  return renderModal(<>
    <Modal.Header>
      <span className='mr-3'>Share the post to your space:</span>
      <SelectSpacePreview
        spaceIds={spaceIds}
        onSelect={saveSpace}
        imageSize={24}
        defaultValue={spaceId?.toString()}
      />
    </Modal.Header>
    <Modal.Content scrolling className='DfShareModalPadding'>
      {renderShareView()}
    </Modal.Content>
    <Modal.Actions>
      <Button onClick={close}>Cancel</Button>
      {renderTxButton()}
    </Modal.Actions>
  </>)
}

export const ShareModal = withMulti(
  InnerShareModal,
  withMyAccount,
  withCalls<Props>(
    spacesQueryToProp(`spaceIdsByOwner`, { paramName: 'address', propName: 'spaceIds' })
  )
);
