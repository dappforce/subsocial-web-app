import styles from './AccountsListModal.module.sass'

import React from 'react'
import { withCalls, withMulti, spaceFollowsQueryToProp, profileFollowsQueryToProp } from '../substrate'
import { GenericAccountId as AccountId } from '@polkadot/types'
import { Modal, Button } from 'antd'
import { ProfilePreviewWithOwner } from './address-views'
import { LARGE_AVATAR_SIZE } from 'src/config/Size.config'
import DataList from '../lists/DataList'

type Props = {
  accounts?: AccountId[],
  // accountsCount: number,
  title: string,
  open: boolean,
  close: () => void
};

const InnerAccountsListModal = (props: Props) => {
  const { accounts, open, close, title } = props

  if (!accounts) return null

  return (
    <Modal
      onCancel={close}
      visible={open}
      title={title}
      className={styles.AccountsListModal}
      footer={<Button onClick={close}>Close</Button>}
    >
      <DataList
        dataSource={accounts}
        renderItem={(item) =>
          <ProfilePreviewWithOwner key={item.toString()} address={item} size={LARGE_AVATAR_SIZE} mini />}
        noDataDesc='Nothing yet'
      />
    </Modal>
  )
}

export const SpaceFollowersModal = withMulti(
  InnerAccountsListModal,
  withCalls<Props>(
    spaceFollowsQueryToProp('spaceFollowers', { paramName: 'id', propName: 'accounts' })
  )
)

export const AccountFollowersModal = withMulti(
  InnerAccountsListModal,
  withCalls<Props>(
    profileFollowsQueryToProp('accountFollowers', { paramName: 'id', propName: 'accounts' })
  )
)

export const AccountFollowingModal = withMulti(
  InnerAccountsListModal,
  withCalls<Props>(
    profileFollowsQueryToProp('accountsFollowedByAccount', { paramName: 'id', propName: 'accounts' })
  )
)
