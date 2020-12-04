import { CommentContent, PostContent } from '@subsocial/types'
import { PostStruct } from 'src/types'
import { SubsocialIpfsApi } from '@subsocial/api/ipfs'
import { IpfsCid } from '@subsocial/types/substrate/interfaces'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { FVoid } from '../utils/types'

// export const useRemoveReplyFromStore = (dispatch: Dispatch, reply: Reply<string>) => {
//   dispatch(removeComment(reply))
//   dispatch(removePost({ postId: reply.replyId }))
// }

// export const useSetReplyToStore = (dispatch: Dispatch, { reply, comment }: SetCommentStore<string | string[]>) => {
//   dispatch(addComments(reply))
//   dispatch(addPost({ posts: comment }))
// }

// export const useChangeReplyToStore = (dispatch: Dispatch, oldReply: Reply<string>, newStore: SetCommentStore<string>) => {
//   useRemoveReplyFromStore(dispatch, oldReply)
//   useSetReplyToStore(dispatch, newStore)
// }

// export const useEditReplyToStore = (dispatch: Dispatch, { replyId, comment }: EditCommentStore) => {
//   dispatch(editPost({ postId: replyId, post: comment }))
// }

type MockComment = {
  fakeId: string,
  address: string
}

export type CommentTxButtonType = {
  ipfs: SubsocialIpfsApi
  setIpfsCid: (hash: IpfsCid) => void
  json: CommentContent | PostContent,
  fakeId?: string,
  disabled?: boolean,
  onClick?: FVoid,
  onSuccess?: TxCallback,
  onFailed?: TxFailedCallback
}

export const buildMockComment = ({ fakeId, address }: MockComment): PostStruct => {
  const id = fakeId

  return {
    id,

    ownerId: address,
    createdByAccount: address,
    createdAtBlock: 0,
    createdAtTime: new Date().getTime(),

    hidden: false,
    contentId: id,
    isRegularPost: false,
    isSharedPost: false,
    isComment: true,

    repliesCount: 0,
    hiddenRepliesCount: 0,
    visibleRepliesCount: 0,

    sharesCount: 0,
    upvotesCount: 0,
    downvotesCount: 0,
    score: 0,
  }
}
