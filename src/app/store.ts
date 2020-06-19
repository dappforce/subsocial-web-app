import { configureStore } from '@reduxjs/toolkit';
import commentReducer from './slices/commentsSlice';
export default configureStore({
  reducer: {
    comments: commentReducer
  }
});
