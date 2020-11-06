import React, { useState, useCallback } from 'react'
import { ViewSpace } from '../spaces/ViewSpace'
import { Segment } from 'src/components/utils/Segment'
import { Tabs } from 'antd'
import { ElasticIndex, ElasticIndexTypes } from '@subsocial/types/offchain/search'
import { useRouter } from 'next/router'
import Section from '../utils/Section'
import { ProfilePreviewWithOwner } from '../profiles/address-views'
import { DataListOptProps } from '../lists/DataList'
import { getElasticsearchResult } from 'src/components/utils/OffchainUtils'
import { InfiniteListByData, InnerLoadMoreFn, RenderItemFn } from '../lists/InfiniteList'
import PostPreview from '../posts/view-post/PostPreview'
import { AnySubsocialData, PostWithAllDetails, ProfileData, SpaceData } from '@subsocial/types'

const { TabPane } = Tabs

type DataResults = {
  index: string
  id: string
  data: (AnySubsocialData | PostWithAllDetails)[]
}

const AllTabKey = 'all'

const panes = [
  {
    key: AllTabKey,
    title: 'All'
  },
  {
    key: 'spaces',
    title: 'Spaces'
  },
  {
    key: 'posts',
    title: 'Posts'
  },
  {
    key: 'profiles',
    title: 'Profiles'
  }
]

const resultToPreview = ({ data, index, id }: DataResults, i: number) => {
  const unknownData = data as unknown
  switch (index) {
    case ElasticIndex.spaces:
      return <ViewSpace key={`${id}-${i}`} spaceData={unknownData as SpaceData} preview withFollowButton />
    case ElasticIndex.posts: {
      const postData = unknownData as PostWithAllDetails
      return <PostPreview key={postData.post.struct.id.toString()} postDetails={postData} withActions />
    }
    case ElasticIndex.profiles:
      return (
        <Segment>
          <ProfilePreviewWithOwner key={`${id}-${i}`} address={id} owner={unknownData as ProfileData} />
        </Segment>
      )
    default:
      return <></>
  }
}

type InnerSearchResultListProps<T> = DataListOptProps & {
  loadingLabel?: string
  renderItem: RenderItemFn<T>
}

const InnerSearchResultList = <T extends DataResults>(props: InnerSearchResultListProps<T>) => {
  const router = useRouter()

  const querySearch: InnerLoadMoreFn<T> = async (page, size) => {
    const getSearchQueryParamFromUrl = (paramStr: string) => {
      return router.query[paramStr]
    }
    const query = getSearchQueryParamFromUrl('q') as string
    const tab = getSearchQueryParamFromUrl('tab') as ElasticIndexTypes[]
    const tagsFilter = getSearchQueryParamFromUrl('tags')
    const offset = (page - 1) * size

    const res = await getElasticsearchResult({
      q: query,
      limit: size,
      indexes: tab || AllTabKey,
      offset,
      tagsFilter/* : nonEmptyStr(tagsFilter) ? [tagsFilter] : tagsFilter */
    })

    return res
  }

  const List = useCallback(() => <InfiniteListByData {...props} loadMore={querySearch} />, [router.asPath])

  return <List />
}

const AllResultsList = () => (
  <InnerSearchResultList loadingLabel={'Loading search results...'} renderItem={resultToPreview} />
)

const ResultsTabs = () => {
  const router = useRouter()

  const getTabIndexFromUrl = (): number => {
    const tabFromUrl = router.query.tab
    const tabIndex = panes.findIndex(pane => pane.key === tabFromUrl)
    return tabIndex < 0 ? 0 : tabIndex
  }

  const initialTabIndex = getTabIndexFromUrl()
  const initialTabKey = panes[initialTabIndex].key

  const [activeTabKey, setActiveTabKey] = useState(initialTabKey)

  const handleTabChange = (key: string) => {
    setActiveTabKey(key)

    const newPath = {
      pathname: router.pathname,
      query: {
        ...router.query,
        tab: key
      }
    }

    router.push(newPath, newPath)
  }

  return (
    <Tabs onChange={handleTabChange} activeKey={activeTabKey.toString()}>
      {panes.map(({ key, title }) => (
        <TabPane key={key} tab={title}>
          <AllResultsList />
        </TabPane>
      ))}
    </Tabs>
  )
}

const SearchResults = () => {
  return (
    <Section>
      <ResultsTabs />
    </Section>
  )
}

export default SearchResults
