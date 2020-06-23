import { configureStore } from '@reduxjs/toolkit';
import commentReducer from './slices/commentsSlice';
import postReducer from './slices/postSlice';
export default configureStore({
  reducer: {
    comments: commentReducer,
    posts: postReducer
  }
});
