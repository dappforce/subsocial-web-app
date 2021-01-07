import * as sub from '@subsocial/types/offchain'
import { HasId, ProfileStruct, SpaceStruct, PostStruct, CommentStruct, SharedPostStruct } from './flatteners'

export type EntityId = string
export type AccountId = EntityId
export type SpaceId = EntityId
export type PostId = EntityId
export type ReactionId = EntityId

/** `ProfileId` is the alias for `AccountId`. */
export type ProfileId = EntityId

export type SummarizedContent = {
  summary: string
  isShowMore: boolean
}

export type DerivedContent<C extends sub.CommonContent> = C & SummarizedContent

export type CommonContent = sub.CommonContent & SummarizedContent
export type ProfileContent = DerivedContent<sub.ProfileContent>
export type SpaceContent = DerivedContent<sub.SpaceContent>
export type PostContent = DerivedContent<sub.PostContent>
export type CommentContent = DerivedContent<sub.CommentContent>
export type SharedPostContent = DerivedContent<sub.SharedPostContent>

export type EntityData<S extends HasId, C extends CommonContent> = {

  // TODO maybe we do not need `id` field here, b/c it can be extracted from `struct`
  // See the usage of this field. Most of the time it looks like copypasta from struct.id
  id: EntityId

  struct: S
  content?: C
}

export type ProfileData = EntityData<ProfileStruct, ProfileContent>
export type SpaceData = EntityData<SpaceStruct, SpaceContent>
export type PostData = EntityData<PostStruct, PostContent>
export type CommentData = EntityData<CommentStruct, CommentContent>
export type SharedPostData = EntityData<SharedPostStruct, SharedPostContent>

export type AnySubsocialData =
  ProfileData |
  SpaceData |
  PostData |
  CommentData |
  SharedPostData

type PostExtensionData = Exclude<PostWithSomeDetails, 'ext'>

export type SpaceWithSomeDetails = SpaceData & {
  owner?: ProfileData
}

export type PostWithSomeDetails = {
  id: EntityId

  // TODO flatten post? (yes)
  post: PostData

  ext?: PostExtensionData
  owner?: ProfileData
  space?: SpaceData
}

export type PostWithAllDetails = Omit<PostWithSomeDetails, 'owner' | 'space'> & {
  owner: ProfileData
  space: SpaceData
}

export type ReactionType = 'Upvote' | 'Downvote'

export enum ReactionEnum {
  Upvote = 'Upvote',
  Downvote = 'Downvote'
}
