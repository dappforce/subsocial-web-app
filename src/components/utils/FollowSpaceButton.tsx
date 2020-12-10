import { notDef } from '@subsocial/utils'
import React from 'react'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'
import { selectSpaceIdsFollowedByAccount } from 'src/rtk/features/spaceIds/followedSpaceIdsSlice'
import { SpaceId } from 'src/types'
import { useMyAddress } from '../auth/MyAccountContext'
import { reloadSpaceIdsFollowedByAccount } from '../spaces/helpers/reloadSpaceIdsFollowedByAccount'
import { BaseTxButtonProps } from '../substrate/SubstrateTxButton'
import { FollowButtonStub } from './FollowButtonStub'
import { useSubsocialApi } from './SubsocialApiContext'
import TxButton from './TxButton'

type FollowSpaceButtonProps = BaseTxButtonProps & {
  spaceId: SpaceId
}

type InnerFollowSpaceButtonProps = FollowSpaceButtonProps & {
  myAddress: string
}

export function FollowSpaceButton (props: FollowSpaceButtonProps) {
  const myAddress = useMyAddress()

  if (!myAddress) return <FollowButtonStub />

  return <InnerFollowSpaceButton {...props} myAddress={myAddress} />
}

export function InnerFollowSpaceButton (props: InnerFollowSpaceButtonProps) {
  const { spaceId, myAddress, ...otherProps } = props
  
  // TODO This selector be moved to upper list component to improve performance.
  const followedSpaceIds = useAppSelector(state => selectSpaceIdsFollowedByAccount(state, myAddress), shallowEqual)
  const isFollower = followedSpaceIds.indexOf(spaceId) >= 0

  const dispatch = useAppDispatch()
  const { substrate } = useSubsocialApi()

  const onTxSuccess = () => {
    // TODO think maybe it's better to check a single fullow: my account + this space?
    reloadSpaceIdsFollowedByAccount({ substrate, dispatch, account: myAddress })
  }

  const buildTxParams = () => [ spaceId ]

  const loading = notDef(isFollower)

  const label = isFollower
    ? 'Unfollow'
    : 'Follow'

  return <TxButton
    type='primary'
    loading={loading}
    ghost={isFollower}
    label={loading ? undefined : label}
    tx={isFollower
      ? 'spaceFollows.unfollowSpace'
      : 'spaceFollows.followSpace'
    }
    params={buildTxParams}
    onSuccess={onTxSuccess}
    withSpinner
    {...otherProps}
  />
}

export default FollowSpaceButton
