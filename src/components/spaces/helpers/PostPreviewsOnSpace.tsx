import { PostWithSomeDetails, SpaceData } from '@subsocial/types/dto';
import { PostId, Space } from '@subsocial/types/substrate/interfaces';
import React, { useCallback } from 'react';
import DataList from 'src/components/lists/DataList';
import { InfiniteListByPage } from 'src/components/lists/InfiniteList';
import PostPreview from 'src/components/posts/view-post/PostPreview';
import { resolveBn } from 'src/components/utils';
import { getPageOfIds } from 'src/components/utils/getIds';
import { Pluralize } from 'src/components/utils/Plularize';
import { useSubsocialApi } from 'src/components/utils/SubsocialApiContext';
import { isMySpace } from './common';
import { CreatePostButton } from './CreatePostButton';
import { useLoadUnlistedPostsByOwner } from './useLoadUnlistedPostsByOwner';

type Props = {
  spaceData: SpaceData
  postIds: PostId[]
  posts: PostWithSomeDetails[]
}

const UnlistedPosts = ({ spaceData, postIds }: Props) => {
  const { struct: space } = spaceData
  const { myHiddenPosts, isLoading } = useLoadUnlistedPostsByOwner({ owner: space.owner, postIds })

  if (isLoading) return null

  const hiddenPostsCount = myHiddenPosts.length

  return hiddenPostsCount ? <DataList
    title={<Pluralize count={hiddenPostsCount} singularText={'Unlisted post'} />}
    dataSource={myHiddenPosts}
    renderItem={(item) =>
      <PostPreview
        key={item.post.struct.id.toString()}
        postDetails={item}
        space={spaceData}
        withActions
      />
    }
  /> : null
}

const getPublicPostsCount = (space: Space): number =>
  resolveBn(space.posts_count)
    .sub(resolveBn(space.hidden_posts_count))
    .toNumber()

export const PostPreviewsOnSpace = (props: Props) => {
  const { spaceData, posts, postIds } = props
  const { struct: space } = spaceData
  const publicPostsCount = getPublicPostsCount(space)
  const { isApiReady, subsocial } = useSubsocialApi()

  const postsSectionTitle = () =>
    <div className='w-100 d-flex justify-content-between align-items-baseline'>
      <span style={{ marginRight: '1rem' }}>
        <Pluralize count={publicPostsCount} singularText='Post'/>
      </span>
      {publicPostsCount > 0 &&
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

        return subsocial.findPublicPostsWithAllDetails(pageIds)
      }}
      totalCount={publicPostsCount}
      noDataDesc='No posts yet'
      noDataExt={isMySpace(space)
        ? <CreatePostButton space={space} />
        : null
      }
      renderItem={(item: PostWithSomeDetails) =>
        <PostPreview
          key={item.post.struct.id.toString()}
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
