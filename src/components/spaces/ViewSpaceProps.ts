import { AccountId, PostId, PostWithSomeDetails, SpaceWithSomeDetails } from 'src/types'

export type ViewSpaceProps = {
  nameOnly?: boolean
  miniPreview?: boolean
  preview?: boolean
  dropdownPreview?: boolean
  withLink?: boolean
  withFollowButton?: boolean
  withTags?: boolean
  withStats?: boolean

  spaceData?: SpaceWithSomeDetails
  postIds?: PostId[],
  posts?: PostWithSomeDetails[]
  followers?: AccountId[]

  imageSize?: number
  onClick?: () => void
  statusCode?: number
}
