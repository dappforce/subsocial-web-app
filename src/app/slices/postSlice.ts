import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { PostWithAllDetails } from '@subsocial/types';
import { Store } from '../types';

export type PostState = Record<string, any>

type AddActionType = {
  posts: PostWithAllDetails | PostWithAllDetails[],
}

type AddReducerType = CaseReducer<PostState, PayloadAction<AddActionType>>

export const addPostReducer: AddReducerType = (state, { payload: { posts } }) => {
  console.log('Post state: ', state, posts)
  const newPost = Array.isArray(posts) ? posts[0] : posts
  const id = newPost.post.struct.id.toString();
  console.log('Post state: ', state, id)
  state[id] = newPost
  return state
}

type EditActionType = {
  postId: string,
  post: PostWithAllDetails
}

type EditReducerType = CaseReducer<PostState, PayloadAction<EditActionType>>

export const editPostReducer: EditReducerType = (state, { payload: { postId, post } }) => {
  state[postId] = post
}

type DeleteActionType = {
  postId: string
}

type DeleteReducerType = CaseReducer<PostState, PayloadAction<DeleteActionType>>

export const removePostReducer: DeleteReducerType = (state, { payload: { postId } }) => {
  delete state[postId]
}

export const postSlice = createSlice({
  name: 'posts',
  initialState: { } as PostState,
  reducers: {
    addPostReducer,
    editPostReducer,
    removePostReducer
  }
});

export const getPost = (state: Store) => state.posts;

export const {
  addPostReducer: addPost,
  editPostReducer: editPost,
  removePostReducer: removePost
} = postSlice.actions

export default postSlice.reducer;
