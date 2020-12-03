import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { PostData, PostWithSomeDetails } from 'src/types'
import { Store, PostsStoreType } from '../types'
import { Profile, Space } from '@subsocial/types/substrate/interfaces'

export type PostState = Record<string, any>

type AddActionType = {
  posts: PostsStoreType,
}

type AddReducerType = CaseReducer<PostState, PayloadAction<AddActionType>>

const serialize = (object?: any) => object ? JSON.parse(JSON.stringify(object)) : undefined

const serializePostWithExt = (item: PostWithSomeDetails): PostWithSomeDetails => {
  // eslint-disable-next-line prefer-const
  let { post, ext, owner, space } = item

  if (owner) {
    let profile = owner.profile
    profile = { ...profile, content: serialize(profile?.content) } as Profile
    owner = { ...owner, profile }
  }

  if (space) {
    const struct = space.struct
    space.struct = { ...struct, content: serialize(struct.content) } as Space
  }

  return {
    owner,
    space,
    post: serializePost(post),
    ext: ext ? serializePostWithExt(ext) : undefined
  }
}

const serializePost = ({ struct, content }: PostData): PostData => {
  return {
    struct: { ...struct, extension: serialize(struct.extension), content: serialize(struct.content) },
    content
  } as PostData
}

export const addPostReducer: AddReducerType = (state, { payload: { posts } }) => {
  const postByIdData = Array.isArray(posts) ? posts : [ posts ]

  postByIdData.forEach(x => {
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


export const postSlice = createSlice({
  name: 'postById',
  initialState: { } as PostState,
  reducers: {
    addPostReducer,
    editPostReducer,
  }
})

export const getPost = (state: Store) => state.postById

export const {
  addPostReducer: addPost,
  editPostReducer: editPost,
} = postSlice.actions

export default postSlice.reducer
