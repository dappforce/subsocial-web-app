import { notDef } from '@subsocial/utils'
import React from 'react'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'
import { selectSpaceIdsByFollower } from 'src/rtk/features/spaceIds/followedSpaceIdsSlice'
import { SpaceStruct } from 'src/types'
import { useMyAddress } from '../auth/MyAccountContext'
import { isHiddenSpace } from '../spaces/helpers'
import { reloadSpaceIdsFollowedByAccount } from '../spaces/helpers/reloadSpaceIdsFollowedByAccount'
import { BaseTxButtonProps } from '../substrate/SubstrateTxButton'
import { FollowButtonStub } from './FollowButtonStub'
import { useSubsocialApi } from './SubsocialApiContext'
import TxButton from './TxButton'
import { useCreateReloadSpace } from 'src/rtk/app/hooks'

type FollowSpaceButtonProps = BaseTxButtonProps & {
  space: SpaceStruct
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
  const { space, myAddress, ...otherProps } = props
  const spaceId = space.id

  // TODO This selector should be moved to the upper list component to improve performance.
  const followedSpaceIds = useAppSelector(state => selectSpaceIdsByFollower(state, myAddress), shallowEqual) || []
  const isFollower = followedSpaceIds.indexOf(spaceId) >= 0

  const reloadSpace = useCreateReloadSpace()
  const dispatch = useAppDispatch()
  const { substrate } = useSubsocialApi()

  const onTxSuccess = () => {
    // TODO think maybe it's better to check a single fullow: my account + this space?
    reloadSpaceIdsFollowedByAccount({ substrate, dispatch, account: myAddress })
    reloadSpace({ id: spaceId })
  }

  const buildTxParams = () => [ spaceId ]

  const loading = notDef(isFollower)

  const label = isFollower
    ? 'Unfollow'
    : 'Follow'

  return <TxButton
    type='primary'
    loading={loading}
    disabled={isHiddenSpace(space)}
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
