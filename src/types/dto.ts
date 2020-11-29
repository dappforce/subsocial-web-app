import { CommonContent, ProfileContent, SpaceContent, PostContent, CommentContent, SharedPostContent } from '@subsocial/types/offchain'
import { HasId, ProfileStruct, SpaceStruct, PostStruct, CommentStruct, SharedPostStruct } from './flatteners'

export type EntityId = string
export type AccountId = EntityId
export type SpaceId = EntityId
export type PostId = EntityId

/** `ProfileId` is the alias for `AccountId`. */
export type ProfileId = EntityId

export type EntityData<S extends HasId, C extends CommonContent> = {
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

  // TODO flatten post?
  post: PostData

  ext?: PostExtensionData
  owner?: ProfileData
  space?: SpaceData
}

export type PostWithAllDetails = Omit<PostWithSomeDetails, 'owner' | 'space'> & {
  owner: ProfileData
  space: SpaceData
}
