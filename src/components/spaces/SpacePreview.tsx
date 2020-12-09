import React from 'react'
import { SpaceWithSomeDetails } from 'src/types'
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
