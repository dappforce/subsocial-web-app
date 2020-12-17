import { combineReducers } from '@reduxjs/toolkit'
import contents from '../features/contents/contentsSlice'
import profiles from '../features/profiles/profilesSlice'
import spaces from '../features/spaces/spacesSlice'
import posts from '../features/posts/postsSlice'
import replyIds from '../features/replies/repliesSlice'
import followedSpaceIds from '../features/spaceIds/followedSpaceIdsSlice'
import ownSpaceIds from '../features/spaceIds/ownSpaceIdsSlice'
import postReactions from '../features/reactions/postReactionsSlice'

const rootReducer = combineReducers({
  contents,
  profiles,
  spaces,
  posts,
  replyIds,
  followedSpaceIds,
  ownSpaceIds,
  postReactions
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
