import React, { useState } from 'react';

import { withCalls, withMulti, profileFollowsQueryToProp } from '../substrate';
import { GenericAccountId as AccountId } from '@polkadot/types';
import { Modal, Button } from 'antd';
import { ProfilePreviewWithOwner } from './address-views';
import { LARGE_AVATAR_SIZE } from 'src/config/Size.config';

type Props = {
  following?: AccountId[],
  followingCount: number
};

const InnerFollowingModal = (props: Props) => {
  const { following, followingCount } = props;
  const [ open, setOpen ] = useState(false);

  const renderFollowing = () => {
    return following && following.map((account) =>
      <div key={account.toString()} className='DfModal'>
        <ProfilePreviewWithOwner
          address={account}
          size={LARGE_AVATAR_SIZE}
          mini
        />
      </div>
    );
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Following ({followingCount})</Button>
      <Modal
        onCancel={close}
        visible={open}
        title={`Following (${followingCount})`}
        style={{ marginTop: '3rem' }}
        footer={<Button onClick={() => setOpen(false)}>Close</Button>}
      >
        {renderFollowing()}
      </Modal>
    </>
  );
};

export const AccountFollowingModal = withMulti(
  InnerFollowingModal,
  withCalls<Props>(
    profileFollowsQueryToProp('accountsFollowedByAccount', { paramName: 'id', propName: 'following' })
  )
);
