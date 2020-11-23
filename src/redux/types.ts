import { CommentsState } from './slices/replyIdsByPostIdSlice'
import { PostState } from './slices/postByIdSlice'
import { PostWithAllDetails, PostWithSomeDetails } from '@subsocial/types'

export type Store = {
  replyIdsByPostId: CommentsState
  postById: PostState
}

export type PostsStoreType = PostWithAllDetails | PostWithSomeDetails | (PostWithAllDetails | PostWithSomeDetails)[]
