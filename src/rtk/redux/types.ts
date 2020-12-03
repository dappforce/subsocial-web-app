import { CommentsState } from './slices/replyIdsByPostIdSlice'
import { PostState } from './slices/postByIdSlice'
import { PostWithAllDetails, PostWithSomeDetails } from 'src/types'

export type Store = {
  replyIdsByPostId: CommentsState
  postById: PostState
}

type Post = PostWithAllDetails | PostWithSomeDetails

export type PostsStoreType = Post | Post[]
