import {
  configureStore,
  getDefaultMiddleware
} from '@reduxjs/toolkit'
import replyIdsByPostIdReducer from './slices/replyIdsByPostIdSlice'
import postByIdReducer from './slices/postByIdSlice'

export default configureStore({
  reducer: {
    replyIdsByPostId: replyIdsByPostIdReducer,
    postById: postByIdReducer
  },
  middleware: getDefaultMiddleware({
    serializableCheck: false
  })
})
