import React, { useState } from 'react'
import { GenericAccountId } from '@polkadot/types'
import { useMyAddress, isMyAddress } from '../auth/MyAccountContext'
import { registry } from '@subsocial/types/substrate/registry'
import { newLogger, notDef } from '@subsocial/utils'
import useSubsocialEffect from '../api/useSubsocialEffect'
import TxButton from './TxButton'
import AccountId from '@polkadot/types/generic/AccountId'
import { FollowButtonStub } from './FollowButtonStub'
import { useGetReloadProfile } from 'src/rtk/app/hooks'

const log = newLogger('FollowAccountButton')

type FollowAccountButtonProps = {
  address: string | AccountId
  className?: string
}

function FollowAccountButton (props: FollowAccountButtonProps) {
  const { address, className = '' } = props
  const myAddress = useMyAddress()
  const reloadProfile = useGetReloadProfile()
  const [ isFollower, setIsFollower ] = useState<boolean>()

  useSubsocialEffect(({ substrate }) => {
    if (!myAddress) return setIsFollower(false)

    let isMounted = true

    const load = async () => {
      const res = await substrate.isAccountFollower(myAddress, address)
      isMounted && setIsFollower(res)
    }

    load().catch(err => log.error(
      'Failed to check if account is a follower of another account',
      address?.toString(), err
    ))

    return () => { isMounted = false }
  }, [ myAddress ])

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
      setIsFollower(!isFollower)
      reloadProfile({ id: myAddress })
      reloadProfile({ id: address.toString() })
    }}
    withSpinner
  />
  </span>
}

export default FollowAccountButton
