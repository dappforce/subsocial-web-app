import React, { useState, useCallback } from 'react'
import { ViewSpace } from '../spaces/ViewSpace'
import { Segment } from 'src/components/utils/Segment'
import { Tabs } from 'antd'
import { ElasticIndex, ElasticIndexTypes } from '@subsocial/types/offchain/search'
import { useRouter } from 'next/router'
import { ProfilePreviewWithOwner } from '../profiles/address-views'
import { DataListOptProps } from '../lists/DataList'
import { queryElasticSearch } from 'src/components/utils/OffchainUtils'
import { InfiniteListByData, InnerLoadMoreFn, RenderItemFn } from '../lists/InfiniteList'
import PostPreview from '../posts/view-post/PostPreview'
import { AnySubsocialData, PostWithAllDetails, ProfileData, SpaceData } from '@subsocial/types'
import { PageContent } from '../main/PageWrapper'
import { nonEmptyArr } from '@subsocial/utils'

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

  const getReqParam = (param: 'tab' | 'q' | 'tags') => {
    return router.query[param]
  }

  const querySearch: InnerLoadMoreFn<T> = async (page, size) => {
    const tab = getReqParam('tab') as ElasticIndexTypes[]
    const query = getReqParam('q') as string
    const tags = getReqParam('tags') as string[]
    const offset = (page - 1) * size

    const res = await queryElasticSearch({
      indexes: tab || AllTabKey,
      q: query,
      tags,
      offset,
      limit: size,
    })

    return res || []
  }

  const List = useCallback(() =>
    <InfiniteListByData {...props} loadMore={querySearch} />,
    [ router.asPath ]
  )

  return <List />
}

const AllResultsList = () => (
  <InnerSearchResultList loadingLabel={'Loading search results...'} renderItem={resultToPreview} />
)

const SearchResults = () => {
  const router = useRouter()

  const getTabIndexFromUrl = (): number => {
    const tabFromUrl = router.query.tab
    const tabIndex = panes.findIndex(pane => pane.key === tabFromUrl)
    return tabIndex < 0 ? 0 : tabIndex
  }

  const initialTabIndex = getTabIndexFromUrl()
  const initialTabKey = panes[initialTabIndex].key

  const [ activeTabKey, setActiveTabKey ] = useState(initialTabKey)

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

  const { q, tabs, tags } = router.query

  const byTags = nonEmptyArr(tags) ? `${tags} tags` : undefined
  const resultsName = q || byTags || 'all items'
  const title = `Search results for ${resultsName} by ${tabs}`

  return (
    <PageContent meta={{ title, tags: tags as string[] }}>
      <Tabs onChange={handleTabChange} activeKey={activeTabKey.toString()}>
        {panes.map(({ key, title }) => (
          <TabPane key={key} tab={title}>
            <AllResultsList />
          </TabPane>
        ))}
      </Tabs>
    </PageContent>
  )
}

export default SearchResults
