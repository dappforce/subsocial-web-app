import React, { useState } from 'react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { AccountId } from '@polkadot/types';
import { queryBlogsToProp } from '../utils/index';
import { Modal, Button } from 'semantic-ui-react';
import AddressMiniDf from '../utils/AddressMiniDf';

type Props = {
  following?: AccountId[],
  followingCount: Number
};

const InnerFollowingModal = (props: Props) => {

  const { following, followingCount } = props;
  const [open, setOpen] = useState(false);

  const renderFollowing = () => {
    return following && following.map((account, index) =>
      <div key={index} style={{ textAlign: 'left', margin: '1rem' }}>
        <AddressMiniDf
          value={account}
          isShort={true}
          isPadded={false}
          size={48}
          withName
          withBalance
          withFollowButton
          withProfilePreview
          withoutCounters
        />
      </div>
    );
  };

  return (
    <Modal
      size='small'
      onClose={close}
      open={open}
      trigger={<Button basic onClick={() => setOpen(true)}>Following ({followingCount})</Button>}
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header><h1>Following ({followingCount})</h1></Modal.Header>
      <Modal.Content scrolling>
        {renderFollowing()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={() => setOpen(false)} />
      </Modal.Actions>
    </Modal>
  );
};

export const AccountFollowingModal = withMulti(
  InnerFollowingModal,
  withCalls<Props>(
    queryBlogsToProp('accountsFollowedByAccount', { paramName: 'id', propName: 'following' })
  )
);
