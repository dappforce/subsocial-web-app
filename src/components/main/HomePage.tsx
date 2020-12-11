import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
import { LatestSpaces } from './LatestSpaces'
import { LatestPosts } from './LatestPosts'
import { SpaceData, PostWithAllDetails, bnsToIds, isPublic } from 'src/types'
import { DEFAULT_DESC, DEFAULT_TITLE, PageContent } from './PageWrapper'
import partition from 'lodash.partition'
import { useIsSignedIn } from '../auth/MyAccountContext'
import { getLastNSpaceIds, getLastNIds } from '../utils/getIds'
import { Tabs } from 'antd'
import Section from '../utils/Section'
import MyFeed from '../activity/MyFeed'
import { uiShowFeed } from '../utils/env'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import { fetchSpaces, selectSpaces } from 'src/rtk/features/spaces/spacesSlice'
import { fetchPosts, selectPosts } from 'src/rtk/features/posts/postsSlice'

const { TabPane } = Tabs

type Props = {
  spacesData: SpaceData[]
  canHaveMoreSpaces: boolean
  postsData: PostWithAllDetails[]
  commentData: PostWithAllDetails[]
}

const LatestUpdate = (props: Props) => {
  const { spacesData, postsData, commentData } = props

  return (
    <PageContent meta={{ title: DEFAULT_TITLE, desc: DEFAULT_DESC }}>
      <LatestPosts {...props} postsData={postsData} type='post' />
      <LatestPosts {...props} postsData={commentData} type='comment' />
      <LatestSpaces {...props} spacesData={spacesData} />
    </PageContent>
  )
}

const TabsHomePage = (props: Props) => {
  const isSignedIn = useIsSignedIn()
  const defaultKey = isSignedIn ? 'feed' : 'latest'
  const [ key, setKey ] = useState<string>(defaultKey)

  useEffect(() => setKey(defaultKey), [ isSignedIn ])

  return <Section className='m-0'>
    <Tabs activeKey={key} onChange={setKey}>
      <TabPane tab='My feed' key='feed'>
        <MyFeed />
      </TabPane>
      <TabPane tab='Latest' key='latest'>
        <LatestUpdate {...props} />
      </TabPane>
    </Tabs>
  </Section>
}

const HomePage: NextPage<Props> = (props) => <Section className='m-0'>
  {uiShowFeed
    ? <TabsHomePage {...props} />
    : <LatestUpdate {...props} />}
</Section>

const LAST_ITEMS_SIZE = 5

getInitialPropsWithRedux(HomePage, async ({ subsocial, dispatch, reduxStore }) => {
  const { substrate } = subsocial
  const { getState } = reduxStore

  const nextSpaceId = await substrate.nextSpaceId()
  const nextPostId = await substrate.nextPostId()

  const latestSpaceIds = bnsToIds(getLastNSpaceIds(nextSpaceId, 3 * LAST_ITEMS_SIZE))
  await dispatch(fetchSpaces({ api: subsocial, ids: latestSpaceIds }))

  // TODO create selectPublicSpaces
  const allSpacesData = selectSpaces(getState(), { ids: latestSpaceIds })
    .filter(isPublic)
  const spacesData = allSpacesData.slice(0, LAST_ITEMS_SIZE)
  const canHaveMoreSpaces = allSpacesData.length >= LAST_ITEMS_SIZE

  const latestPostIds = bnsToIds(getLastNIds(nextPostId, 6 * LAST_ITEMS_SIZE))
  await dispatch(fetchPosts({ api: subsocial, ids: latestPostIds }))

  // TODO create selectPublicPosts
  const allPostsData = selectPosts(getState(), { ids: latestPostIds })
    .filter(({ post }) => isPublic(post)) as PostWithAllDetails[]

  const [ publicCommentData, publicPostsData ] =
    partition(allPostsData, (x) => x.post.struct.isComment)

  const postsData = publicPostsData.slice(0, LAST_ITEMS_SIZE)
  const commentData = publicCommentData.slice(0, LAST_ITEMS_SIZE)

  return {
    spacesData,
    postsData,
    commentData,
    canHaveMoreSpaces
  }
})

export default HomePage
