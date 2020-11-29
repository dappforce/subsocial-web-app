import { CommonContent, ProfileContent, SpaceContent, PostContent, CommentContent, SharedPostContent } from '@subsocial/types/offchain'
import { HasId, ProfileStruct, SpaceStruct, PostStruct, CommentStruct, SharedPostStruct } from './flatteners'

type Data<S extends HasId, C extends CommonContent> = {
  struct: S
  content?: C
}

export type ProfileData = Data<ProfileStruct, ProfileContent>
export type SpaceData = Data<SpaceStruct, SpaceContent>
export type PostData = Data<PostStruct, PostContent>
export type CommentData = Data<CommentStruct, CommentContent>
export type SharedPostData = Data<SharedPostStruct, SharedPostContent>

export type AnySubsocialData =
  ProfileData |
  SpaceData |
  PostData |
  CommentData |
  SharedPostData

type PostExtensionData = Exclude<PostWithSomeDetails, 'ext'>

export type PostWithSomeDetails = {
  post: PostData
  ext?: PostExtensionData
  owner?: ProfileData
  space?: SpaceData
}

export type PostWithAllDetails = {
  post: PostData
  ext?: PostExtensionData
  owner: ProfileData
  space: SpaceData
}
