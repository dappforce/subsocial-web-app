import React from 'react';

import { withCalls, withMulti } from '../substrate';
import { GenericAccountId as AccountId } from '@polkadot/types';
import { spaceFollowsQueryToProp, profileFollowsQueryToProp } from '../utils/index';
import { Modal, Button } from 'antd';
import { ProfilePreviewWithOwner } from './address-views';
import ListData from '../utils/DataList';

type Props = {
  accounts?: AccountId[],
  accountsCount: number,
  title: string,
  open: boolean,
  close: () => void
};

const InnerAccountsListModal = (props: Props) => {
  const { accounts, open, close, title } = props;

  if (!accounts) return null;

  return (
    <Modal
      onCancel={close}
      visible={open}
      title={title}
      className='DfAccountsModal'
      style={{ marginTop: '3rem' }}
      footer={<Button onClick={close}>Close</Button>}
    >
      <ListData
        dataSource={accounts}
        renderItem={(item) =>
          <ProfilePreviewWithOwner key={item.toString()} address={item} mini />}
        noDataDesc='No followers yet'
      />
    </Modal>
  );
};

export const SpaceFollowersModal = withMulti(
  InnerAccountsListModal,
  withCalls<Props>(
    spaceFollowsQueryToProp('spaceFollowers', { paramName: 'id', propName: 'accounts' })
  )
);

export const AccountFollowersModal = withMulti(
  InnerAccountsListModal,
  withCalls<Props>(
    profileFollowsQueryToProp('accountFollowers', { paramName: 'id', propName: 'accounts' })
  )
);

export const AccountFollowingModal = withMulti(
  InnerAccountsListModal,
  withCalls<Props>(
    profileFollowsQueryToProp('accountsFollowedByAccount', { paramName: 'id', propName: 'accounts' })
  )
);
