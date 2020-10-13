import React, { useState } from 'react';
import { withCalls, withMulti, spacesQueryToProp } from '../../substrate';
import { Modal } from 'antd';
import Button from 'antd/lib/button';
import { withMyAccount, MyAccountProps } from '../../utils/MyAccount';
import { LabeledValue } from 'antd/lib/select';
import SelectSpacePreview from '../../utils/SelectSpacePreview';
import BN from 'bn.js';
import { OptionId } from '@subsocial/types/substrate/classes';
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton';
import dynamic from 'next/dynamic';
import { isEmptyArray } from '@subsocial/utils';
import { DynamicPostPreview } from '../view-post/DynamicPostPreview';
import { CreateSpaceButton } from '../../spaces/helpers';
import styles from './index.module.sass'
import { useRouter } from 'next/router';
import { postUrl } from '../../urls/subsocial';
import { PostId, Space, SpaceId } from '@subsocial/types/substrate/interfaces';

const TxButton = dynamic(() => import('../../utils/TxButton'), { ssr: false });

type Props = MyAccountProps & {
  postId: BN
  spaceIds?: BN[]
  open: boolean
  onClose: () => void
}

const InnerMoveModal = (props: Props) => {
  const { open, onClose, postId, spaceIds } = props;

  if (!spaceIds) {
    return null
  }

  const router = useRouter()

  const [ spaceId, setSpaceId ] = useState(spaceIds[0]);

  const onTxFailed: TxFailedCallback = () => {
    // TODO show a failure message
    onClose()
  };

  const onTxSuccess: TxCallback = () => {
    // TODO show a success message
    router.push(
      '/[spaceId]/posts/[postId]',
      postUrl(
        { id: spaceId as SpaceId } as Space,
        { id: postId as PostId })
      )
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
      params={newTxParams}
      tx={'posts.movePost'}
      onFailed={onTxFailed}
      onSuccess={onTxSuccess}
      successMessage='Moved post to another space'
      failedMessage='Failed to move post'
    />

  const renderMoveView = () => {
    if (isEmptyArray(spaceIds)) {
      return (
        <CreateSpaceButton>
          <a className='ui button primary'>
            Create my first space
          </a>
        </CreateSpaceButton>
      )
    }

    return <div className={styles.DfShareModalBody}>
      <span className={styles.DfShareModalSelector}>
        <SelectSpacePreview
          spaceIds={spaceIds || []}
          onSelect={saveSpace}
          imageSize={24}
          defaultValue={spaceId?.toString()}
        />
      </span>

      <div style={{margin: '0.75rem 0'}}>
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
    title={'Move post to another space'}
    className={styles.DfShareModal}
    footer={
      <>
        <Button onClick={onClose}>Cancel</Button>
        {renderTxButton()}
      </>
    }
  >
    {renderMoveView()}
  </Modal>
}

export const MoveModal = withMulti(
  InnerMoveModal,
  withMyAccount,
  withCalls<Props>(
    spacesQueryToProp(`spaceIdsByOwner`, { paramName: 'address', propName: 'spaceIds' })
  )
);
