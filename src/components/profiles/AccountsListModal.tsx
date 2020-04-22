import React from 'react';

import { withCalls, withMulti } from '@polkadot/react-api';
import { GenericAccountId as AccountId } from '@polkadot/types';
import { socialQueryToProp } from '../utils/index';
import { Modal, Button } from 'semantic-ui-react';
import { TX_BUTTON_SIZE } from '../../config/Size.config';
import { ProfilePreviewWithOwner } from './address-views';

type Props = {
  accounts?: AccountId[],
  accountsCount: number,
  title: string,
  open: boolean,
  close: () => void
};

const InnerAccountsListModal = (props: Props) => {
  const { accounts, open, close, title } = props;

  const renderAccounts = () => {
    return accounts && accounts.map((account) =>
      <ProfilePreviewWithOwner
        key={account.toString()}
        address={account}
        mini
      />
    );
  };

  return (
    <Modal
      size='small'
      onClose={close}
      open={open}
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header>{title}</Modal.Header>
      <Modal.Content scrolling>
        {renderAccounts()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' size={TX_BUTTON_SIZE} onClick={close} />
      </Modal.Actions>
    </Modal>
  );
};

export const BlogFollowersModal = withMulti(
  InnerAccountsListModal,
  withCalls<Props>(
    socialQueryToProp('blogFollowers', { paramName: 'id', propName: 'accounts' })
  )
);

export const AccountFollowersModal = withMulti(
  InnerAccountsListModal,
  withCalls<Props>(
    socialQueryToProp('accountFollowers', { paramName: 'id', propName: 'accounts' })
  )
);

export const AccountFollowingModal = withMulti(
  InnerAccountsListModal,
  withCalls<Props>(
    socialQueryToProp('accountsFollowedByAccount', { paramName: 'id', propName: 'accounts' })
  )
);
