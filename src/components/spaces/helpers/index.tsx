import React, { useState } from 'react';
import { Menu, Dropdown, Button } from 'antd';
import Link from 'next/link';
import { EllipsisOutlined, SettingOutlined, PlusOutlined } from '@ant-design/icons';
import { SpaceData, PostWithSomeDetails } from '@subsocial/types/dto'
import { Space, PostId } from '@subsocial/types/substrate/interfaces'
import { isMyAddress } from 'src/components/auth/MyAccountContext';
import { editSpaceUrl, newPostUrl } from 'src/components/utils/urls';
import HiddenSpaceButton from '../HiddenSpaceButton';
import { BareProps } from 'src/components/utils/types';
import { Pluralize } from 'src/components/utils/Plularize';
import ListData from 'src/components/utils/DataList';
import PostPreview from 'src/components/posts/view-post/PostPreview';
import useSubsocialEffect from 'src/components/api/useSubsocialEffect';
import { Loading } from 'src/components/utils';

type SpaceProps = {
  space: Space
}

type DropdownMenuProps = {
  spaceData: SpaceData,
  vertical?: boolean
}

export const DropdownMenu = ({ spaceData: { struct }, vertical }: DropdownMenuProps) => {
  const { id, owner } = struct
  const isMySpace = isMyAddress(owner)

  const spaceKey = `space-${id.toString()}`

  const menu =
    <Menu>
      <Menu.Item key={`edit-space-${spaceKey}`}>
        <Link href={`/spaces/[id]/edit`} as={editSpaceUrl(struct)}>
          <a className='item'>Edit space</a>
        </Link>
      </Menu.Item>
      <Menu.Item key={`edit-nav-${spaceKey}`}>
        <EditMenuLink space={struct} className='item' />
      </Menu.Item>
      <Menu.Item key={`create-post-${spaceKey}`}>
        <Link href={newPostUrl(struct)}>
          <a className='item'>Write post</a>
        </Link>
      </Menu.Item>
      <Menu.Item key={`hidden-${spaceKey}`}>
        <HiddenSpaceButton space={struct} asLink />
      </Menu.Item>
    </Menu>

  return isMySpace
    ? <Dropdown overlay={menu} placement='bottomRight'>
      <EllipsisOutlined rotate={vertical ? 90 : 0} />
    </Dropdown>
    : null
};

type EditMenuLinkProps = BareProps & SpaceProps & {
  withIcon?: boolean
}

export const EditMenuLink = ({ space: { id, owner }, withIcon }: EditMenuLinkProps) => isMyAddress(owner)
  ? <div className='SpaceNavSettings'>
    <Link
      href='/spaces/[spaceId]/space-navigation/edit'
      as={`/spaces/${id}/space-navigation/edit`}
    >
      <a className='DfSecondaryColor'>
        {withIcon && <SettingOutlined className='mr-2' />}
        Edit Menu
      </a>
    </Link>
  </div>
  : null

export const CreatePostButton = ({ space }: SpaceProps) => <Button type='primary' ghost href={newPostUrl(space)}>Create post</Button>

type PostsOnSpacePageProps = {
  spaceData: SpaceData,
  postIds: PostId[],
  posts: PostWithSomeDetails[]
}

type LoadHiddenPostBySpacepProps = SpaceProps & {
  postIds: PostId[]
}

const useLoadHiddenPostBySpace = ({ space: { owner }, postIds }: LoadHiddenPostBySpacepProps) => {
  const isMySpaces = isMyAddress(owner)
  const [ myHiddenPosts, setMyHiddenPosts ] = useState<PostWithSomeDetails[]>()

  useSubsocialEffect(({ subsocial }) => {
    if (!isMySpaces) return setMyHiddenPosts([])

    subsocial.findHiddenPostsWithSomeDetails({ ids: postIds, withOwner: true })
      .then(setMyHiddenPosts)

  }, [ postIds.length, isMySpaces ])

  return {
    isLoading: !myHiddenPosts,
    myHiddenPosts: myHiddenPosts || []
  }
}

const HiddenPostList = ({ spaceData, postIds }: PostsOnSpacePageProps) => {
  const { struct: space } = spaceData
  const { myHiddenPosts, isLoading } = useLoadHiddenPostBySpace({ space, postIds })

  if (isLoading) return <Loading />

  const hiddenPostsCount = myHiddenPosts.length
  return hiddenPostsCount ? <ListData
    title={<Pluralize count={hiddenPostsCount} singularText={'hidden post'} />}
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

export const PostPreviewsOnSpace = (props: PostsOnSpacePageProps) => {
  const { spaceData, posts } = props
  const { struct: space } = spaceData
  const { owner } = space

  const isMySpace = isMyAddress(owner)
  const NewPostButton = () => isMySpace
  // TODO include in CreatePostButton
    ? <Button href={newPostUrl(space)} icon={<PlusOutlined />} size='small' className='DfGreyButton'>New post</Button>
    : null

  const postsSectionTitle = () =>
    <div className='DfSection--withButton'>
      <span style={{ marginRight: '1rem' }}>
        <Pluralize count={posts.length} singularText='Post'/>
      </span>
      {posts.length > 0 && <NewPostButton />}
    </div>

  const VisiblePostList = () => <ListData
    title={postsSectionTitle()}
    dataSource={posts}
    noDataDesc='No posts yet'
    noDataExt={isMySpace
    // TODO replace with Next Link + URL builder
      ? <CreatePostButton space={space} />
      : null
    }
    renderItem={(item) =>
      <PostPreview
        key={item.post.struct.id.toString()}
        postDetails={item}
        space={spaceData}
        withActions
      />
    }
  />

  return <>
    <VisiblePostList />
    <HiddenPostList {...props} />
  </>
}
