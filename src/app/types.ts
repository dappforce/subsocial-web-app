import { CommentsState } from './slices/commentsSlice';
import { PostState } from './slices/postSlice';

export type Store = {
  comments: CommentsState
  posts: PostState
}
