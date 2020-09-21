import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import BN from 'bn.js';

import { getSubsocialApi } from '../utils/SubsocialConnect';
import { HeadMeta } from '../utils/HeadMeta';
import { LatestSpaces } from './LatestSpaces';
import { LatestPosts } from './LatestPosts';
import { SpaceData, PostWithAllDetails } from '@subsocial/types';
import { PageContent } from './PageWrapper';
import partition from 'lodash.partition';
import { isComment } from '../posts/view-post';
import { useIsSignIn } from '../auth/MyAccountContext';
import { MyFeed } from '../activity/MyFeed';
import { getLastNSpaceIds, getLastNIds } from '../utils/getIds';
import { Tabs } from 'antd';
import Section from '../utils/Section';

const { TabPane } = Tabs

const FIFTY = new BN(50)
const MAX_TO_SHOW = 5

type Props = {
  spacesData: SpaceData[]
  postsData: PostWithAllDetails[]
  commentData: PostWithAllDetails[]
}

const LatestUpdate = (props: Props) => {
  const { spacesData, postsData, commentData } = props;

  return (
    <PageContent>
      <HeadMeta
        title='Latest posts and spaces'
        desc='Subsocial is an open decentralized social network'
      />
      <LatestPosts {...props} postsData={postsData} type='post' />
      <LatestPosts {...props} postsData={commentData} type='comment' />
      <LatestSpaces {...props} spacesData={spacesData} />
    </PageContent>
  )
}

const HomePage: NextPage<Props> = (props) => {
  const isSignIn = useIsSignIn()
  const defaultKey = isSignIn ? 'feed' : 'latest'
  const [ key, setKey ] = useState<string>(defaultKey)

  useEffect(() => setKey(defaultKey), [ isSignIn ])

  const LatestTab = <TabPane tab='Latest' key='latest'>
    <LatestUpdate {...props}/>
  </TabPane>

  const FeedTab = isSignIn
    ? <TabPane tab='My feed' key='feed'>
        <MyFeed />
      </TabPane>
    : null

  return <Section>
    <Tabs activeKey={key} onChange={setKey}>
      {FeedTab}
      {LatestTab}
    </Tabs>
  </Section>
}

HomePage.getInitialProps = async (): Promise<Props> => {
  const subsocial = await getSubsocialApi();
  const { substrate } = subsocial
  const nextSpaceId = await substrate.nextSpaceId()
  const nextPostId = await substrate.nextPostId()

  const latestSpaceIds = getLastNSpaceIds(nextSpaceId, FIFTY);
  const publicSpacesData = await subsocial.findPublicSpaces(latestSpaceIds) as SpaceData[]
  const spacesData = publicSpacesData.slice(0, MAX_TO_SHOW)

  const latestPostIds = getLastNIds(nextPostId, FIFTY);
  const allPostsData = await subsocial.findPublicPostsWithAllDetails(latestPostIds);
  const [ visibleCommentData, visiblePostsData ] = partition(allPostsData, (x) => isComment(x.post.struct.extension))

  const postsData = visiblePostsData.slice(0, MAX_TO_SHOW)
  const commentData = visibleCommentData.slice(0, MAX_TO_SHOW)

  return {
    spacesData,
    postsData,
    commentData
  }
}

export default HomePage;
