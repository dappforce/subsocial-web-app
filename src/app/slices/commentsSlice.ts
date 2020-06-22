import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { PostWithAllDetails } from '@subsocial/types';
import { Store } from '../types';

export type CommentsState = {
  comments: Record<string, any>
}

type ActionType<T> = {
  postId: string,
  replies: T
}

type ReducerSingleType = CaseReducer<CommentsState, PayloadAction<ActionType<PostWithAllDetails>>>
type ReducerType = CaseReducer<CommentsState, PayloadAction<ActionType<PostWithAllDetails | PostWithAllDetails[]>>>

export const addCommentReducer: ReducerType = (state, { payload: { replies, postId } }) => {
  const { comments } = state
  const newComments = Array.isArray(replies) ? replies : [ replies ]

  const postIdStr = postId.toString()
  let currentComments: PostWithAllDetails[] | undefined = comments[postIdStr]

  if (currentComments) {
    currentComments.push(...newComments)
  } else {
    currentComments = newComments
  }

  comments[postIdStr] = currentComments
  console.log('Comments state: ', currentComments, postIdStr)
  state.comments = comments
}

export const editCommentReducer: ReducerSingleType = (state, { payload: { replies, postId } }) => {
  const { comments } = state

  const postIdStr = postId.toString()
  let currentComments: PostWithAllDetails[] | undefined = comments[postIdStr]

  if (currentComments) {
    currentComments = currentComments.map(item =>
      item.post.struct.id.toString() === replies.post.struct.id.toString() ? replies : item)
  } else {
    currentComments = [ replies ]
  }

  comments[postIdStr] = currentComments

  return state
}

export const removeCommentReducer: ReducerSingleType = (state, { payload: { replies, postId } }) => {
  const { comments } = state

  const postIdStr = postId.toString()
  let currentComments: PostWithAllDetails[] | undefined = comments[postIdStr]

  if (currentComments) {
    currentComments = currentComments.filter(item =>
      item.post.struct.id.toString() !== replies.post.struct.id.toString())
    comments[postIdStr] = currentComments
  }

  return state
}

export const commentSlice = createSlice({
  name: 'comments',
  initialState: { comments: {} } as CommentsState,
  reducers: {
    addCommentReducer,
    editCommentReducer,
    removeCommentReducer
  }
});

export const getComments = (state: Store) => state.comments;

export const {
  addCommentReducer: addComments,
  editCommentReducer: editComment,
  removeCommentReducer: removeComment
} = commentSlice.actions

export default commentSlice.reducer;
