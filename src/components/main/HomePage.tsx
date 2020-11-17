import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import { LatestSpaces } from './LatestSpaces';
import { LatestPosts } from './LatestPosts';
import { SpaceData, PostWithAllDetails } from '@subsocial/types';
import { PageContent } from './PageWrapper';
import partition from 'lodash.partition';
import { isComment } from '../posts/view-post';
import { useIsSignedIn } from '../auth/MyAccountContext';
import { getLastNSpaceIds, getLastNIds } from '../utils/getIds';
import { Tabs } from 'antd';
import Section from '../utils/Section';
import MyFeed from '../activity/MyFeed';
import { uiShowFeed } from '../utils/env';

const { TabPane } = Tabs

type Props = {
  spacesData: SpaceData[]
  canHaveMoreSpaces: boolean
  postsData: PostWithAllDetails[]
  commentData: PostWithAllDetails[]
}

const LatestUpdate = (props: Props) => {
  const { spacesData, postsData, commentData } = props;

  return (
    <PageContent 
      meta={{
        title: 'Latest posts and spaces',
        desc: 'Subsocial is an open decentralized social network'
      }}
    >
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

HomePage.getInitialProps = async (): Promise<Props> => {
  const subsocial = await getSubsocialApi();
  const { substrate } = subsocial
  const nextSpaceId = await substrate.nextSpaceId()
  const nextPostId = await substrate.nextPostId()

  const latestSpaceIds = getLastNSpaceIds(nextSpaceId, 3 * LAST_ITEMS_SIZE);
  const publicSpacesData = await subsocial.findPublicSpaces(latestSpaceIds) as SpaceData[]
  const spacesData = publicSpacesData.slice(0, LAST_ITEMS_SIZE)
  const canHaveMoreSpaces = publicSpacesData.length >= LAST_ITEMS_SIZE

  const latestPostIds = getLastNIds(nextPostId, 6 * LAST_ITEMS_SIZE);
  const allPostsData = await subsocial.findPublicPostsWithAllDetails(latestPostIds);
  const [ publicCommentData, publicPostsData ] =
    partition(allPostsData, (x) => isComment(x.post.struct.extension))

  const postsData = publicPostsData.slice(0, LAST_ITEMS_SIZE)
  const commentData = publicCommentData.slice(0, LAST_ITEMS_SIZE)

  return {
    spacesData,
    postsData,
    commentData,
    canHaveMoreSpaces
  }
}

export default HomePage;
