import React from 'react'
import { GenericAccountId } from '@polkadot/types'
import { useMyAddress, isMyAddress } from '../auth/MyAccountContext'
import { registry } from '@subsocial/types/substrate/registry'
import { notDef } from '@subsocial/utils'
import TxButton from './TxButton'
import AccountId from '@polkadot/types/generic/AccountId'
import { FollowButtonStub } from './FollowButtonStub'
import { useCreateReloadAccountIdsByFollower, useCreateReloadProfile } from 'src/rtk/app/hooks'
import { selectAccountIdsFollowedByAccount } from 'src/rtk/features/profiles/followedAccountIdsSlice'
import { useAppSelector } from 'src/rtk/app/store'
import { shallowEqual } from 'react-redux'

type FollowAccountButtonProps = {
  address: string | AccountId
  className?: string
}

function FollowAccountButton (props: FollowAccountButtonProps) {
  const { address, className = '' } = props
  const myAddress = useMyAddress()
  // TODO This selector be moved to upper list component to improve performance.
  const followedAccountIds = useAppSelector(state => myAddress ? selectAccountIdsFollowedByAccount(state, myAddress) : [], shallowEqual) || []
  const isFollower = followedAccountIds.indexOf(address.toString()) >= 0
  const reloadProfile = useCreateReloadProfile()
  const reloadAccountIdsByFollower = useCreateReloadAccountIdsByFollower()
  // I'm signed in and I am looking at my account
  if (myAddress && isMyAddress(address)) return null

  // I'm not signed in
  if (!myAddress) return <FollowButtonStub />

  const accountId = new GenericAccountId(registry, address)

  const buildTxParams = () => [ accountId ]

  const loading = notDef(isFollower)

  const label = isFollower
    ? 'Unfollow'
    : 'Follow'

  return <span className={className}><TxButton
    className='DfFollowAccountButton'
    type='primary'
    loading={loading}
    ghost={isFollower}
    label={loading ? undefined : label }
    tx={isFollower
      ? 'profileFollows.unfollowAccount'
      : 'profileFollows.followAccount'}
    params={buildTxParams}
    onSuccess={() => {
      console.log('SUCESSS')
      reloadAccountIdsByFollower({ id: myAddress })
      reloadProfile({ id: myAddress })
      reloadProfile({ id: address.toString() })
    }}
    withSpinner
  />
  </span>
}

export default FollowAccountButton
