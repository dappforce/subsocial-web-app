import React, { useState } from 'react';

import { withCalls, withMulti } from '@polkadot/react-api';
import { GenericAccountId as AccountId } from '@polkadot/types';
import { queryBlogsToProp } from '../utils/index';
import { Modal, Button } from 'semantic-ui-react';
import { TxBUTTON_SIZE } from '../../config/Size.config';
import dynamic from 'next/dynamic';
const AddressComponents = dynamic(() => import('../utils/AddressComponents'), { ssr: false });

type Props = {
  following?: AccountId[],
  followingCount: number
};

const InnerFollowingModal = (props: Props) => {
  const { following, followingCount } = props;
  const [ open, setOpen ] = useState(false);

  const renderFollowing = () => {
    return following && following.map((account, index) =>
      <div key={index} className='DfModal'>
        <AddressComponents
          value={account}
          isShort={true}
          isPadded={false}
          size={48}
          withName
          withBalance
          withFollowButton
          variant='mini-preview'
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
      <Modal.Header>Following ({followingCount})</Modal.Header>
      <Modal.Content scrolling>
        {renderFollowing()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close'size={TxBUTTON_SIZE} onClick={() => setOpen(false)} />
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
