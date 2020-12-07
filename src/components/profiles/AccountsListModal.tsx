import styles from './AccountsListModal.module.sass'

import React, { FC } from 'react'
import { withCalls, withMulti, spaceFollowsQueryToProp, profileFollowsQueryToProp } from '../substrate'
import { GenericAccountId as AccountId } from '@polkadot/types'
import { Modal, Button } from 'antd'
import { ProfilePreviewWithOwner } from './address-views'
import { LARGE_AVATAR_SIZE } from 'src/config/Size.config'
import DataList from '../lists/DataList'
import { AnyAccountId } from '@subsocial/types'

type OuterProps = {
  id: AnyAccountId
  title: React.ReactNode
  open: boolean
  close: () => void
}

type InnerProps = OuterProps & {
  accounts?: AccountId[],
}

const InnerAccountsListModal = (props: InnerProps) => {
  const { accounts, title, open, close } = props

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
        noDataDesc='Nothing yet'
        dataSource={accounts}
        getKey={item => item.toString()}
        renderItem={(item) =>
          <ProfilePreviewWithOwner address={item} size={LARGE_AVATAR_SIZE} mini />
        }
      />
    </Modal>
  )
}

// TODO use redux
export const SpaceFollowersModal = withMulti(
  InnerAccountsListModal,
  withCalls(
    spaceFollowsQueryToProp('spaceFollowers', { paramName: 'id', propName: 'accounts' })
  )
) as FC<OuterProps>

// TODO use redux
export const AccountFollowersModal = withMulti(
  InnerAccountsListModal,
  withCalls(
    profileFollowsQueryToProp('accountFollowers', { paramName: 'id', propName: 'accounts' })
  )
) as FC<OuterProps>

// TODO use redux
export const AccountFollowingModal = withMulti(
  InnerAccountsListModal,
  withCalls(
    profileFollowsQueryToProp('accountsFollowedByAccount', { paramName: 'id', propName: 'accounts' })
  )
) as FC<OuterProps>
