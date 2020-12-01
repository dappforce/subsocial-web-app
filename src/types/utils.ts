import BN from 'bn.js'
import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces'
import { PostData, SharedPostData, CommentData, EntityId } from 'src/types/dto'

export function idToBn (id: EntityId): BN {
  return BN.isBN(id) ? id : new BN(id)
}

export function idsToBns (ids: EntityId[]): BN[] {
  return ids.map(idToBn)
}

export function idToSpaceId (id: EntityId): SpaceId {
  return idToBn(id) as SpaceId
}

export function idToPostId (id: EntityId): PostId {
  return idToBn(id) as PostId
}

export function asSharedPostData (postData: PostData): SharedPostData {
  return postData as unknown as SharedPostData
}

export function asCommentData (postData: PostData): CommentData {
  return postData as unknown as CommentData
}
  
