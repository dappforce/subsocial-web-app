import { Option } from '@polkadot/types/codec'
import { AccountId } from '@polkadot/types/interfaces/runtime'
import { bool } from '@polkadot/types/primitive'
import { EntityId } from '@reduxjs/toolkit'
import { AnyAccountId, PostContent, ProfileContent, SpaceContent } from '@subsocial/types'
import { Content, Post, SocialAccount, Space, WhoAndWhen } from '@subsocial/types/substrate/interfaces'
import BN from 'bn.js'

type Id = string

type Cid = string

export type HasId = {
  id: Id
}

type CanHaveParentId = {
  parentId?: Id
}

type CanHaveSpaceId = {
  spaceId?: Id
}

type CanHaveContent = {
  contentId?: Cid
}

type HasOwner = {
  owner: string // TODO rename to ownerAccount? to prevent clash with owner: Profile
}

type CanHaveHandle = {
  handle?: string
}

type HasCreated = {
  createdByAccount: string
  createdAtBlock: number
  createdAtTime: number
}

type CanBeUpdated = {
  isUpdated: boolean
  updatedByAccount?: string
  updatedAtBlock?: number
  updatedAtTime?: number
}

type CanBeHidden = {
  isHidden: boolean
  // isPublic: boolean
}

export type NormalizedSuperCommon =
  HasCreated &
  CanBeUpdated &
  CanHaveContent

type NormalizedSpaceOrPost =
  NormalizedSuperCommon &
  HasId &
  HasOwner &
  CanBeHidden

export type NormalizedSpace = NormalizedSpaceOrPost & CanHaveParentId & CanHaveHandle & {
  totalPostsCount: number
  hiddenPostsCount: number
  visiblePostsCount: number

  followersCount: number
  score: number
  // permissions?: SpacePermissions
}

export type NormalizedPost = NormalizedSpaceOrPost & CanHaveSpaceId & {
  totalRepliesCount: number
  hiddenRepliesCount: number
  visibleRepliesCount: number

  sharesCount: number
  upvotesCount: number
  downvotesCount: number
  score: number

  isRegularPost: boolean
  isSharedPost: boolean
  isComment: boolean
}

type NormalizedSocialAccount = HasId & {
  followersCount: number
  followingAccountsCount: number
  followingSpacesCount: number
  reputation: number
  hasProfile: boolean
}

type CommentExtension = {
  parentId?: Id
  rootPostId: Id
}

type SharedPostExtension = {
  sharedPostId: Id
}

type NormalizedPostExtension = {} | CommentExtension | SharedPostExtension

type NormalizedSharedPost = NormalizedPost & SharedPostExtension

type NormalizedComment = NormalizedPost & CommentExtension

export type NormalizedProfile =
  NormalizedSocialAccount &
  Partial<NormalizedSuperCommon>

export type SpaceWithContent = NormalizedSpace & SpaceContent
export type PostWithContent = NormalizedPost & PostContent
export type ProfileWithContent = NormalizedProfile & ProfileContent

type SuperCommonStruct = {
  created: WhoAndWhen
  updated: Option<WhoAndWhen>
  content: Content
}

type SpaceOrPostStruct = SuperCommonStruct & {
  id: BN
  owner: AccountId
  hidden: bool
}

export type SocialAccountWithId = {
  id: AnyAccountId
  struct: SocialAccount
}

export function getUniqueIds<E = {}> (structs: E[], idFieldName: keyof E): EntityId[] {
  const ids = new Set<EntityId>()
  structs.forEach((struct) => {
    const id = (struct as any)[idFieldName]
    if (id && !ids.has(id)) {
      ids.add(id)
    }
  })
  return Array.from(ids)
}

export const getUniqueOwnerIds = (entities: HasOwner[]) =>
  getUniqueIds(entities, 'owner')

export const getUniqueContentIds = (entities: CanHaveContent[]) =>
  getUniqueIds(entities, 'contentId')

function getUpdatedFields ({ updated }: SuperCommonStruct): CanBeUpdated {
  const maybeUpdated = updated.unwrapOr(undefined)
  let res: CanBeUpdated = {
    isUpdated: updated.isSome,
  }
  if (maybeUpdated) {
    res = {
      ...res,
      updatedByAccount: maybeUpdated.account.toString(),
      updatedAtBlock: maybeUpdated.block.toNumber(),
      updatedAtTime: maybeUpdated.time.toNumber(),
    }
  }
  return res
}

function getContentFields ({ content }: SuperCommonStruct): CanHaveContent {
  let res: CanHaveContent = {}
  if (content.isIpfs) {
    res = {
      contentId: content.asIpfs.toString()
    }
  }
  return res
}

function normalizeSuperCommonStruct (struct: SuperCommonStruct): NormalizedSuperCommon {
  const { created } = struct

  return {
    // created:
    createdByAccount: created.account.toString(),
    createdAtBlock: created.block.toNumber(),
    createdAtTime: created.time.toNumber(),

    ...getUpdatedFields(struct),
    ...getContentFields(struct),
  }
}

function normalizeSpaceOrPostStruct (struct: SpaceOrPostStruct): NormalizedSpaceOrPost {
  return {
    ...normalizeSuperCommonStruct(struct),
    id: struct.id.toString(),
    owner: struct.owner.toString(),
    isHidden: struct.hidden.isTrue,
  }
}

export function normalizeSpaceStruct (struct: Space): NormalizedSpace {
  const totalPostsCount = struct.posts_count.toNumber()
  const hiddenPostsCount = struct.hidden_posts_count.toNumber()
  const visiblePostsCount = totalPostsCount - hiddenPostsCount

  let parentField: CanHaveParentId = {}
  if (struct.parent_id.isSome) {
    parentField = {
      parentId: struct.parent_id.unwrap().toString()
    }
  }

  let handleField: CanHaveHandle = {}
  if (struct.handle.isSome) {
    handleField = {
      handle: struct.handle.unwrap().toString()
    }
  }

  return {
    ...normalizeSpaceOrPostStruct(struct),
    ...parentField,
    ...handleField,

    totalPostsCount,
    hiddenPostsCount,
    visiblePostsCount,
    followersCount: struct.followers_count.toNumber(),
    score: struct.score.toNumber()
  }
}

export function normalizeSpaceStructs (structs: Space[]): NormalizedSpace[] {
  return structs.map(normalizeSpaceStruct)
}

function flattenPostExtension (struct: Post): NormalizedPostExtension {
  const { isSharedPost, isComment } = struct.extension
  let normExt: NormalizedPostExtension = {}

  if (isSharedPost) {
    const sharedPost: SharedPostExtension = {
      sharedPostId: struct.extension.asSharedPost.toString()
    }
    normExt = sharedPost
  } else if (isComment) {
    const { parent_id, root_post_id } = struct.extension.asComment
    const comment: CommentExtension = {
      rootPostId: root_post_id.toString()
    }
    if (parent_id.isSome) {
      comment.parentId = parent_id.unwrap().toString()
    }
    normExt = comment
  }

  return normExt
}

export function normalizePostStruct (struct: Post): NormalizedPost {
  const totalRepliesCount = struct.replies_count.toNumber()
  const hiddenRepliesCount = struct.hidden_replies_count.toNumber()
  const visibleRepliesCount = totalRepliesCount - hiddenRepliesCount
  const { isRegularPost, isSharedPost, isComment } = struct.extension
  const extensionFields = flattenPostExtension(struct)
  
  let spaceField: CanHaveSpaceId = {}
  if (struct.space_id.isSome) {
    spaceField = {
      spaceId: struct.space_id.unwrap().toString(),
    }
  }

  return {
    ...normalizeSpaceOrPostStruct(struct),
    ...spaceField,
    ...extensionFields,

    totalRepliesCount,
    hiddenRepliesCount,
    visibleRepliesCount,

    sharesCount: struct.shares_count.toNumber(),
    upvotesCount: struct.upvotes_count.toNumber(),
    downvotesCount: struct.downvotes_count.toNumber(),
    score: struct.score.toNumber(),

    isRegularPost,
    isSharedPost,
    isComment,
  }
}

export function normalizePostStructs (structs: Post[]): NormalizedPost[] {
  return structs.map(normalizePostStruct)
}

export function asNormalizedSharedPost (post: NormalizedPost): NormalizedSharedPost {
  if (!post.isSharedPost) throw new Error('Not a shared post')

  return post as NormalizedSharedPost
}

export function asNormalizedComment (post: NormalizedPost): NormalizedComment {
  if (!post.isComment) throw new Error('Not a comment')

  return post as NormalizedComment
}

export function normalizeProfileStruct (account: AnyAccountId, struct: SocialAccount): NormalizedProfile {
  const profile = struct.profile.unwrapOr(undefined)
  const hasProfile = struct.profile.isSome
  const maybeProfile: Partial<NormalizedSuperCommon> = profile
    ? normalizeSuperCommonStruct(profile)
    : {}

  return {
    id: account.toString(),

    followersCount: struct.followers_count.toNumber(),
    followingAccountsCount: struct.following_accounts_count.toNumber(),
    followingSpacesCount: struct.following_spaces_count.toNumber(),
    reputation: struct.reputation.toNumber(),

    hasProfile,
    ...maybeProfile
  }
}

export function normalizeProfileStructs (accounts: SocialAccountWithId[]): NormalizedProfile[] {
  return accounts.map(({ id, struct }) => normalizeProfileStruct(id, struct))
}
