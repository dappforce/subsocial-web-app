import React from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from 'src/rtk/app/store'
import { selectSpace } from 'src/rtk/features/spaces/spacesSlice'
import { SpaceId, SpaceWithSomeDetails } from 'src/types'
import { isUnlistedSpace } from './helpers'
import { ViewSpace } from './ViewSpace'

type PreviewProps = {
  space: SpaceWithSomeDetails
}

export const SpacePreview = ({ space }: PreviewProps) =>
  <ViewSpace
    spaceData={space}
    withFollowButton
    preview
  />

type PublicSpacePreviewByIdProps = {
  spaceId: SpaceId
}

export const PublicSpacePreviewById = ({ spaceId }: PublicSpacePreviewByIdProps) => {
  const space = useAppSelector(state => selectSpace(state, { id: spaceId }), shallowEqual)

  if (isUnlistedSpace(space)) return null

  return <SpacePreview space={space} />
}
  