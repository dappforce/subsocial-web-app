import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { Store } from '../types';
import { PostWithAllDetails } from '@subsocial/types';

export type CommentsState = Record<string, string[]>

type ActionType<T> = {
  postId: string,
  replyId: T
}

type ReducerSingleType = CaseReducer<CommentsState, PayloadAction<ActionType<string>>>
type ReducerType = CaseReducer<CommentsState, PayloadAction<ActionType<string | string[]>>>

export const addCommentReducer: ReducerType = (state, { payload: { replyId, postId } }) => {
  const ids = Array.isArray(replyId)
    ? replyId
    : [ replyId ]

  let currentReplyIds: string[] | undefined = state[postId]

  if (currentReplyIds) {
    currentReplyIds.push(...ids)
  } else {
    currentReplyIds = ids
  }

  state[postId] = currentReplyIds
  console.log('Comments state: ', currentReplyIds, postId)

  return state
}

export const editCommentReducer: ReducerSingleType = (state, { payload: { replyId, postId } }) => {
  const postIdStr = postId.toString()
  let currentComments: string[] | undefined = state[postIdStr]

  const replyIdStr = replyId.toString()

  if (currentComments) {
    currentComments = currentComments.map(item =>
      item === replyIdStr ? replyIdStr : item)
  } else {
    currentComments = [replyIdStr]
  }

  state[postIdStr] = currentComments

  return state
}

export const removeCommentReducer: ReducerSingleType = (state, { payload: { replyId, postId } }) => {

  const postIdStr = postId.toString()
  let currentComments: string[] | undefined = state[postIdStr]

  const replyIdStr = replyId.toString()

  if (currentComments) {
    currentComments = currentComments.filter(item =>
      item !== replyIdStr)
    state[postIdStr] = currentComments
  }

  return state
}

export const commentSlice = createSlice({
  name: 'comments',
  initialState: {} as CommentsState,
  reducers: {
    addCommentReducer,
    editCommentReducer,
    removeCommentReducer
  }
});

export const getComments = (store: Store, parentId: string): PostWithAllDetails[] => {
  const { comments, posts } = store
  console.log('Posts store', store, parentId)
  const commentIds = comments[parentId]
  console.log('Comments ids', commentIds)
  const res = commentIds && posts
    ? commentIds
      .map(x => {
        return posts[x]
      })
      .filter(x => x !== undefined)
    : []
  console.log(res)
  return res
};

export const getCommentsStore = (state: Store) => state.comments;

export const {
  addCommentReducer: addComments,
  editCommentReducer: editComment,
  removeCommentReducer: removeComment
} = commentSlice.actions

export default commentSlice.reducer;
