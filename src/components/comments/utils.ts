import { addComments, removeComment } from 'src/app/slices/commentsSlice';
import { addPost, removePost, editPost } from 'src/app/slices/postSlice';
import { Dispatch } from '@reduxjs/toolkit';
import { PostsStoreType } from 'src/app/types';
import { PostData, PostWithSomeDetails, CommentContent, PostContent } from '@subsocial/types';
import { SubsocialIpfsApi } from '@subsocial/api/ipfs';
import { IpfsHash } from '@subsocial/types/substrate/interfaces';
import { TxCallback, TxFailedCallback } from '@subsocial/react-components/Status/types';
import { FVoid } from '../utils/types';

type Reply<T> = {
  replyId: T,
  parentId: string
}

type SetCommentStore<T> = {
  reply: Reply<T>,
  comment: PostsStoreType
}

type EditCommentStore = {
  replyId: string,
  comment: PostData
}

export const useRemoveReplyFromStore = (dispatch: Dispatch, reply: Reply<string>) => {
  dispatch(removeComment(reply));
  dispatch(removePost({ postId: reply.replyId }))
}

export const useSetReplyToStore = (dispatch: Dispatch, { reply, comment }: SetCommentStore<string | string[]>) => {
  dispatch(addComments(reply));
  dispatch(addPost({ posts: comment }))
}

export const useChangeReplyToStore = (dispatch: Dispatch, oldReply: Reply<string>, newStore: SetCommentStore<string>) => {
  console.log('useChangeReplyToStore >>>', newStore, oldReply)
  useRemoveReplyFromStore(dispatch, oldReply)
  useSetReplyToStore(dispatch, newStore)
}

export const useEditReplyToStore = (dispatch: Dispatch, { replyId, comment }: EditCommentStore) => {
  dispatch(editPost({ postId: replyId, post: comment }))
}

type MockComment = {
  fakeId: string,
  account: string,
  content: CommentContent
}

export type CommentTxButtonType = {
  ipfs: SubsocialIpfsApi
  setIpfsHash: (hash: IpfsHash) => void
  json: CommentContent | PostContent,
  fakeId?: string,
  isDisabled?: boolean,
  onClick?: FVoid,
  onSuccess?: TxCallback,
  onFailed?: TxFailedCallback
}

export const buildMockComment = ({ fakeId, account, content }: MockComment) => {
  return {
    post: {
      struct: {
        id: fakeId,
        created: {
          account: account,
          time: new Date().getTime()
        },
        score: 0,
        shares_count: 0,
        direct_replies_count: 0,
        space_id: null,
        extension: null

      },
      content: content
    }
  } as any as PostWithSomeDetails
}
