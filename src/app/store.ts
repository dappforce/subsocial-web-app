import {
  configureStore,
  getDefaultMiddleware
} from '@reduxjs/toolkit'
import commentReducer from './slices/commentsSlice';
import postReducer from './slices/postSlice';

export default configureStore({
  reducer: {
    comments: commentReducer,
    posts: postReducer
  },
  middleware: getDefaultMiddleware({
    serializableCheck: false
  })
})
