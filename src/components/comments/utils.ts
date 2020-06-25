import { addComments, removeComment } from 'src/app/slices/commentsSlice';
import { addPost, removePost } from 'src/app/slices/postSlice';
import { Dispatch } from '@reduxjs/toolkit';
import { PostsStoreType } from 'src/app/types';

type Reply<T> = {
  replyId: T,
  parentId: string
}

type SetCommentStore<T> = {
  reply: Reply<T>,
  comment: PostsStoreType
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
