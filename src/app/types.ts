import { CommentsState } from './slices/commentsSlice';
import { PostState } from './slices/postSlice';
import { PostWithAllDetails, PostWithSomeDetails } from '@subsocial/types';

export type Store = {
  comments: CommentsState
  posts: PostState
}

export type PostsStoreType = PostWithAllDetails | PostWithSomeDetails | (PostWithAllDetails | PostWithSomeDetails)[]
