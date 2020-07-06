import React from 'react';

import { withCalls, withMulti } from '../substrate';
import { GenericAccountId as AccountId } from '@polkadot/types';
import { spaceFollowsQueryToProp, profileFollowsQueryToProp } from '../utils/index';
import { Modal, Button } from 'semantic-ui-react';
import { TX_BUTTON_SIZE } from '../../config/Size.config';
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
      size='small'
      onClose={close}
      open={open}
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header>{title}</Modal.Header>
      <Modal.Content scrolling className='DfAccountsModal'>
        <ListData
          dataSource={accounts}
          renderItem={(item) =>
            <ProfilePreviewWithOwner key={item.toString()} address={item} mini />}
          noDataDesc='No followers yet'
        />
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' size={TX_BUTTON_SIZE} onClick={close} />
      </Modal.Actions>
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
