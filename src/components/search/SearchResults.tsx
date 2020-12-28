import React, { useState, useCallback } from 'react'
import { Segment } from 'src/components/utils/Segment'
import { Tabs } from 'antd'
import { ElasticIndex, ElasticIndexTypes } from '@subsocial/types/offchain/search'
import { useRouter } from 'next/router'
import { ProfilePreviewWithOwner } from '../profiles/address-views'
import { DataListOptProps } from '../lists/DataList'
import { queryElasticSearch, SearchResultsType } from 'src/components/utils/OffchainUtils'
import { InfiniteListByData } from '../lists/InfiniteList'
import { AccountId, PostId, SpaceId } from 'src/types'
import { PageContent } from '../main/PageWrapper'
import { nonEmptyArr } from '@subsocial/utils'
import { DataListItemProps, InnerLoadMoreFn } from '../lists'
import { useAppDispatch } from 'src/rtk/app/store'
import { useSubsocialApi } from '../utils/SubsocialApiContext'
import { fetchPosts } from 'src/rtk/features/posts/postsSlice'
import { fetchProfiles } from 'src/rtk/features/profiles/profilesSlice'
import { fetchSpaces } from 'src/rtk/features/spaces/spacesSlice'
import { PublicPostPreviewById } from '../posts/PublicPostPreview'
import { PublicSpacePreviewById } from '../spaces/SpacePreview'

const { TabPane } = Tabs

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

const resultToPreview = ({ _index, _id }: SearchResultsType) => {
  switch (_index) {
    case ElasticIndex.spaces:
      return <PublicSpacePreviewById spaceId={_id} />
    case ElasticIndex.posts: {
      return <PublicPostPreviewById postId={_id} />
    }
    case ElasticIndex.profiles:
      return (
        <Segment>
          <ProfilePreviewWithOwner address={_id} />
        </Segment>
      )
    default:
      return <></>
  }
}

type InnerSearchResultListProps<T> = DataListOptProps & DataListItemProps<T> & {
  loadingLabel?: string
}

const InnerSearchResultList = <T extends SearchResultsType>(props: InnerSearchResultListProps<T>) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { subsocial: api } = useSubsocialApi()

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
    console.log('SEARCH:', res)
    if (!res) return []

    const ownerIds: AccountId[] = []
    const spaceIds: SpaceId[] = []
    const postIds: PostId[] = []

    res.forEach(({ _index, _id }) => {
      switch (_index) {
        case ElasticIndex.spaces: {
          spaceIds.push(_id)
          break
        }
        case ElasticIndex.posts: {
          postIds.push(_id)
          break
        }
        case ElasticIndex.profiles: {
          ownerIds.push(_id)
          break
        }
      }
    })

    await Promise.all([
      dispatch(fetchSpaces({ ids: spaceIds, api })),
      dispatch(fetchProfiles({ ids: ownerIds, api })),
      dispatch(fetchPosts({ ids: postIds, api })),
    ])

    return (res || []) as any 
  }

  const List = useCallback(() =>
    <InfiniteListByData {...props} loadMore={querySearch} />,
    [ router.asPath ]
  )

  return <List />
}

const AllResultsList = () =>
  <InnerSearchResultList
    loadingLabel={'Loading search results...'}
    getKey={item => `${item._index}-${item._id}`}
    renderItem={resultToPreview}
  />

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

  const byTags = nonEmptyArr(tags) ? `${tags} tag(s)` : undefined
  const resultsName = q || byTags || 'all items'
  const title = `Search results for ${resultsName} in ${tabs}`

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
