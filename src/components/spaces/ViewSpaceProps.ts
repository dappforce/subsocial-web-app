import BN from 'bn.js'
import { GenericAccountId as AccountId } from '@polkadot/types'
import { SpaceData, PostWithSomeDetails, ProfileData } from '@subsocial/types/dto'
import { PostId } from '@subsocial/types/substrate/interfaces'

export type ViewSpaceProps = {
  nameOnly?: boolean
  miniPreview?: boolean
  preview?: boolean
  dropdownPreview?: boolean
  withLink?: boolean
  withFollowButton?: boolean
  withTags?: boolean
  withStats?: boolean
  id?: BN
  spaceData?: SpaceData
  owner?: ProfileData,
  postIds?: PostId[],
  posts?: PostWithSomeDetails[]
  followers?: AccountId[]
  imageSize?: number
  onClick?: () => void
  statusCode?: number
}
