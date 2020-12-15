import { PostWithSomeDetails, SpaceData, PostId } from 'src/types'
import React from 'react'
import DataList from 'src/components/lists/DataList'
import { InfiniteListByPage } from 'src/components/lists/InfiniteList'
import { PostPreview } from 'src/components/posts/view-post/PostPreview'
import { getPageOfIds } from 'src/components/utils/getIds'
import { Pluralize } from 'src/components/utils/Plularize'
import { useSubsocialApi } from 'src/components/utils/SubsocialApiContext'
import { isMySpace } from './common'
import { CreatePostButton } from './CreatePostButton'
import { useLoadUnlistedPostsByOwner } from './useLoadUnlistedPostsByOwner'
import { PublicPostPreviewById } from 'src/components/posts/PublicPostPreview'
import { fetchPosts } from 'src/rtk/features/posts/postsSlice'
import { useDispatch } from 'react-redux'
import { useFetchMyPostReactions } from 'src/rtk/features/reactions/postReactionsHooks'

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

const PostsSectionTitle = React.memo((props: Props) => {
  const { spaceData } = props
  const { struct: space } = spaceData
  const { visiblePostsCount } = space

  return <div className='w-100 d-flex justify-content-between align-items-baseline'>
    <span style={{ marginRight: '1rem' }}>
      <Pluralize count={visiblePostsCount} singularText='Post'/>
    </span>
    {visiblePostsCount > 0 &&
      <CreatePostButton space={space} title={'Write Post'} className='mb-2' />
    }
  </div>
})

const InfiniteListOfPublicPosts = (props: Props) => {
  const { spaceData, posts, postIds } = props
  const { struct: space } = spaceData
  const { visiblePostsCount } = space
  const initialPostIds = posts.map((p) => p.id)

  const dispatch = useDispatch()
  const { isApiReady, subsocial } = useSubsocialApi()

  return <InfiniteListByPage
    withLoadMoreLink
    loadingLabel='Loading more posts...'
    title={<PostsSectionTitle {...props} />}
    dataSource={initialPostIds}
    loadMore={async (page, size) => {
      if (!isApiReady) return initialPostIds

      const pageIds = getPageOfIds(postIds, { page, size })
      await dispatch(fetchPosts({ api: subsocial, ids: postIds }))

      return pageIds
    }}
    totalCount={visiblePostsCount}
    noDataDesc='No posts yet'
    noDataExt={isMySpace(space)
      ? <CreatePostButton space={space} />
      : null
    }
    getKey={postId => postId}
    renderItem={(postId) => <PublicPostPreviewById postId={postId} />}
  />
}

export const PostPreviewsOnSpace = (props: Props) => {
  useFetchMyPostReactions(props.postIds)
  return <>
    <InfiniteListOfPublicPosts {...props} />
    {/* // TODO unlisted posts should be on a separate tab if the current user is a space owner. */}
    <UnlistedPosts {...props} />
  </>
}
