import styles from './AccountsListModal.module.sass'

import React from 'react'
import { GenericAccountId as AccountId } from '@polkadot/types'
import { Modal, Button } from 'antd'
import { ProfilePreviewWithOwner } from './address-views'
import { LARGE_AVATAR_SIZE } from 'src/config/Size.config'
import DataList from '../lists/DataList'
import { AnyAccountId } from '@subsocial/types'
import { Loading } from '../utils'
import { useGetSubstrateIdsById } from '../substrate/hooks/useGetIdsById'

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
export const SpaceFollowersModal = (props: OuterProps) => {
  const { entities, loading } = useGetSubstrateIdsById<AccountId>({ pallete: 'spaceFollows', method: 'spaceFollowers', id: props.id.toString() })
  
  if (loading) return <Loading label='Loading space followers...' />

  return <InnerAccountsListModal {...props} accounts={entities} />
} 

// TODO use redux
export const AccountFollowersModal = (props: OuterProps) => {
  const { entities, loading } = useGetSubstrateIdsById<AccountId>({ pallete: 'profileFollows', method: 'accountFollowers', id: props.id.toString() })
  
  if (loading) return <Loading label='Loading space followers...' />

  return <InnerAccountsListModal {...props} accounts={entities} />
} 

const useAccountsFollowedByAccount = (id: AnyAccountId) => useGetSubstrateIdsById<AccountId>({ pallete: 'profileFollows', method: 'accountsFollowedByAccount', id: id.toString() })

// TODO use redux
export const AccountFollowingModal = (props: OuterProps) => {
  const { entities, loading } = useAccountsFollowedByAccount(props.id)
  
  if (loading) return <Loading label='Loading space followers...' />

  return <InnerAccountsListModal {...props} accounts={entities} />
} 