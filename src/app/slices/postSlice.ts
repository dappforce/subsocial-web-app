import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { PostData, PostWithSomeDetails } from '@subsocial/types';
import { Store, PostsStoreType } from '../types';

export type PostState = Record<string, any>

type AddActionType = {
  posts: PostsStoreType,
}

type AddReducerType = CaseReducer<PostState, PayloadAction<AddActionType>>

const serializePostWithExt = (item: PostWithSomeDetails): PostWithSomeDetails => {
  const { post, ext } = item

  return {
    ...item,
    post: serializePost(post),
    ext: ext ? serializePostWithExt(ext) : undefined
  }
}

const serializePost = ({ struct, content }: PostData): PostData => {
  return {
    struct: { ...struct, extension: JSON.parse(JSON.stringify(struct.extension)) },
    content
  } as PostData
}

export const addPostReducer: AddReducerType = (state, { payload: { posts } }) => {
  const postsData = Array.isArray(posts) ? posts : [ posts ]

  postsData.forEach(x => {
    const id = x.post.struct.id.toString()
    state[id] = serializePostWithExt(x)
  })
}

export type EditActionType = {
  postId: string,
  post: PostData
}

type EditReducerType = CaseReducer<PostState, PayloadAction<EditActionType>>

export const editPostReducer: EditReducerType = (state, { payload: { postId, post } }) => {
  let oldPost: PostWithSomeDetails | undefined = state[postId]

  if (!oldPost) {
    oldPost = { post }
  }
  oldPost = { ...oldPost, post }

  state[postId] = oldPost
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
