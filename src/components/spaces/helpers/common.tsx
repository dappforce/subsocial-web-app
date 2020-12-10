import { isDef } from '@subsocial/utils'
import React from 'react'
import { isMyAddress } from 'src/components/auth/MyAccountContext'
import { HasSpaceIdOrHandle, newPostUrl } from 'src/components/urls'
import NoData from 'src/components/utils/EmptyList'
import { EntityStatusProps, HiddenEntityPanel } from 'src/components/utils/EntityStatusPanels'
import { SpaceData, SpaceStruct } from 'src/types'
import { isHidden as notMyAndHidden } from 'src/components/utils'

export type SpaceProps = {
  space: SpaceStruct
}

export const isHiddenSpace = (space: SpaceStruct) =>
  !space || space.hidden === true

export const isUnlistedSpace = (spaceData?: SpaceData): spaceData is undefined => 
  !spaceData || !spaceData.struct || notMyAndHidden({ struct: spaceData.struct })

export const isMySpace = (space?: SpaceStruct) =>
  isDef(space) && isMyAddress(space.ownerId)

export const createNewPostLinkProps = (space: HasSpaceIdOrHandle) => ({
  href: '/[spaceId]/posts/new',
  as: newPostUrl(space)
})

type StatusProps = EntityStatusProps & {
  space: SpaceStruct
}

export const HiddenSpaceAlert = (props: StatusProps) =>
  <HiddenEntityPanel struct={props.space} type='space' {...props} />

export const SpaceNotFound = () =>
  <NoData description='Space not found' />
