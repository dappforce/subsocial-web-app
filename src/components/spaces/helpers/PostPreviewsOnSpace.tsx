import { PostWithSomeDetails, SpaceData, PostId } from 'src/types'
import React, { useCallback } from 'react'
import DataList from 'src/components/lists/DataList'
import { InfiniteListByPage } from 'src/components/lists/InfiniteList'
import PostPreview from 'src/components/posts/view-post/PostPreview'
import { getPageOfIds } from 'src/components/utils/getIds'
import { Pluralize } from 'src/components/utils/Plularize'
import { useSubsocialApi } from 'src/components/utils/SubsocialApiContext'
import { isMySpace } from './common'
import { CreatePostButton } from './CreatePostButton'
import { useLoadUnlistedPostsByOwner } from './useLoadUnlistedPostsByOwner'

type Props = {
  spaceData: SpaceData
  postIds: PostId[]
  posts: PostWithSomeDetails[]
}

const UnlistedPosts = ({ spaceData, postIds }: Props) => {
  const { struct: { ownerId } } = spaceData

  // TODO use redux
  const { myHiddenPosts, isLoading } = useLoadUnlistedPostsByOwner({ owner: ownerId, postIds })

  if (isLoading) return null

  const unlistedCount = myHiddenPosts.length
  if (!unlistedCount) return null

  return (
    <DataList
      title={<Pluralize count={unlistedCount} singularText={'Unlisted post'} />}
      dataSource={myHiddenPosts}
      getKey={item => item.id}
      renderItem={(item) =>
        <PostPreview
          postDetails={item}
          space={spaceData}
          withActions
        />
      }
    />
  )
}

export const PostPreviewsOnSpace = (props: Props) => {
  const { spaceData, posts, postIds } = props
  const { struct: space } = spaceData
  const { visiblePostsCount } = space
  const { isApiReady, flatApi } = useSubsocialApi()

  const postsSectionTitle = () =>
    <div className='w-100 d-flex justify-content-between align-items-baseline'>
      <span style={{ marginRight: '1rem' }}>
        <Pluralize count={visiblePostsCount} singularText='Post'/>
      </span>
      {visiblePostsCount > 0 &&
        <CreatePostButton space={space} title={'Write Post'} className='mb-2' />
      }
    </div>

  const PublicPosts = useCallback(() =>
    <InfiniteListByPage
      withLoadMoreLink
      loadingLabel='Loading more posts...'
      title={postsSectionTitle()}
      dataSource={posts}
      loadMore={async (page, size) => {
        if (!isApiReady) return posts

        const pageIds = getPageOfIds(postIds, { page, size })

        // TODO use redux
        return flatApi.findPublicPostsWithAllDetails(pageIds)
      }}
      totalCount={visiblePostsCount}
      noDataDesc='No posts yet'
      noDataExt={isMySpace(space)
        ? <CreatePostButton space={space} />
        : null
      }
      getKey={item => item.id}
      renderItem={(item) =>
        <PostPreview
          postDetails={item}
          space={spaceData}
          withActions
        />
      }
    />, [ isApiReady ])

  return <>
    <PublicPosts />
    <UnlistedPosts {...props} />
  </>
}
