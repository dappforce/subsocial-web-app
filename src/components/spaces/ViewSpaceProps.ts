import BN from 'bn.js'
import { GenericAccountId as AccountId } from '@polkadot/types'
import { SpaceData, PostWithSomeDetails, ProfileData } from '@subsocial/types/dto'
import { PostId } from '@subsocial/types/substrate/interfaces'

export type ViewSpaceProps = {
  preview?: boolean
  nameOnly?: boolean
  dropdownPreview?: boolean
  withLink?: boolean
  miniPreview?: boolean
  previewDetails?: boolean
  withFollowButton?: boolean
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
