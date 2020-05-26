import BN from 'bn.js'
import { GenericAccountId as AccountId } from '@polkadot/types'
import { BlogData, PostWithAllDetails, ProfileData } from '@subsocial/types/dto'

export type ViewBlogProps = {
  preview?: boolean
  nameOnly?: boolean
  dropdownPreview?: boolean
  withLink?: boolean
  miniPreview?: boolean
  previewDetails?: boolean
  withFollowButton?: boolean
  id?: BN
  blogData?: BlogData
  owner?: ProfileData
  posts?: PostWithAllDetails[]
  followers?: AccountId[]
  imageSize?: number
  onClick?: () => void
  statusCode?: number
}
