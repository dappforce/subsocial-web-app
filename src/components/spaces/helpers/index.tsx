import React, { useState } from 'react';
import { Menu, Dropdown, Button } from 'antd';
import Link from 'next/link';
import { EllipsisOutlined, /* SettingOutlined, */ PlusOutlined } from '@ant-design/icons';
import { SpaceData, PostWithSomeDetails } from '@subsocial/types/dto'
import { Space, PostId } from '@subsocial/types/substrate/interfaces'
import { AnyAccountId } from '@subsocial/types/substrate'
import { isMyAddress } from 'src/components/auth/MyAccountContext';
import { editSpaceUrl, newPostUrl } from 'src/components/utils/urls';
import HiddenSpaceButton from '../HiddenSpaceButton';
import { BareProps } from 'src/components/utils/types';
import { Pluralize } from 'src/components/utils/Plularize';
import ListData from 'src/components/utils/DataList';
import PostPreview from 'src/components/posts/view-post/PostPreview';
import useSubsocialEffect from 'src/components/api/useSubsocialEffect';
import { Loading } from 'src/components/utils';
import { isHidden } from '@subsocial/api/utils/visibility-filter'
import { ButtonProps } from 'antd/lib/button'
import NoData from 'src/components/utils/EmptyList';
import HiddenAlert, { BaseHiddenAlertProps } from 'src/components/utils/HiddenAlert';
import { useRouter } from 'next/router';
import { getSpaceId } from 'src/components/substrate';
import { isEmptyStr } from '@subsocial/utils';
import ButtonLink from 'src/components/utils/ButtonLink';

type SpaceProps = {
  space: Space
}

type DropdownMenuProps = BareProps & {
  spaceData: SpaceData,
  vertical?: boolean
}

export const DropdownMenu = ({ spaceData: { struct }, vertical, style, className }: DropdownMenuProps) => {
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
      {isHiddenSpace(struct)
        ? null
        : <Menu.Item key={`create-post-${spaceKey}`}>
          <Link href={newPostUrl(struct)}>
            <a className='item'>Write post</a>
          </Link>
        </Menu.Item>}
      <Menu.Item key={`hidden-${spaceKey}`}>
        <HiddenSpaceButton space={struct} asLink />
      </Menu.Item>
    </Menu>

  return isMySpace
    ? <Dropdown overlay={menu} placement='bottomRight'>
      <EllipsisOutlined rotate={vertical ? 90 : 0} style={style} className={className} />
    </Dropdown>
    : null
};

type EditMenuLinkProps = BareProps & SpaceProps & {
  withIcon?: boolean
}

export const EditMenuLink = ({ space: { id, owner }, withIcon }: EditMenuLinkProps) => /* isMyAddress(owner)
  ? <div className='SpaceNavSettings'>
    <Link
      href='/spaces/[spaceId]/space-navigation/edit'
      as={`/spaces/${id}/space-navigation/edit`}
    >
      <a className='DfSecondaryColor'>
        {withIcon && <SettingOutlined className='mr-2' />}
        Edit menu
      </a>
    </Link>
  </div>
  : */ null

type CreatePostButtonProps = SpaceProps & ButtonProps & {
  title?: React.ReactNode
}

export const CreatePostButton = (props: CreatePostButtonProps) => {
  const { space, title = 'Create post' } = props

  if (isHiddenSpace(space)) return null

  return isMyAddress(space.owner)
    ? <Button
      {...props}
      type='primary'
      icon={<PlusOutlined />}
      ghost href={newPostUrl(space)}
    >
      {title}
    </Button>
    : null
}

type PostsOnSpacePageProps = {
  spaceData: SpaceData,
  postIds: PostId[],
  posts: PostWithSomeDetails[]
}

type LoadHiddenPostByOwnerProps = {
  owner: AnyAccountId
  postIds: PostId[]
}

export const useLoadHiddenPostByOwner = ({ owner, postIds }: LoadHiddenPostByOwnerProps) => {
  const isMySpaces = isMyAddress(owner)
  const [ myHiddenPosts, setMyHiddenPosts ] = useState<PostWithSomeDetails[]>()

  useSubsocialEffect(({ subsocial }) => {
    if (!isMySpaces) return setMyHiddenPosts([])

    subsocial.findHiddenPostsWithAllDetails(postIds)
      .then(setMyHiddenPosts)

  }, [ postIds.length, isMySpaces ])

  return {
    isLoading: !myHiddenPosts,
    myHiddenPosts: myHiddenPosts || []
  }
}

const HiddenPostList = ({ spaceData, postIds }: PostsOnSpacePageProps) => {
  const { struct: space } = spaceData
  const { myHiddenPosts, isLoading } = useLoadHiddenPostByOwner({ owner: space.owner, postIds })

  if (isLoading) return <Loading />

  const hiddenPostsCount = myHiddenPosts.length
  return hiddenPostsCount ? <ListData
    title={<Pluralize count={hiddenPostsCount} singularText={'Hidden post'} />}
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

  const postsSectionTitle = () =>
    <div className='w-100 d-flex justify-content-between align-items-baseline'>
      <span style={{ marginRight: '1rem' }}>
        <Pluralize count={posts.length} singularText='Post'/>
      </span>
      {posts.length > 0 && <CreatePostButton space={space} title={'Write Post'} className='mb-2' />}
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

type HiddenSpaceAlertProps = BaseHiddenAlertProps & {
  space: Space
}

export const HiddenSpaceAlert = (props: HiddenSpaceAlertProps) => <HiddenAlert struct={props.space} type='space' {...props} />

export const isHiddenSpace = (space: Space) => isHidden(space)

export const SpaceNotFound = () => <NoData description={'Space not found'} />

export const useLoadHiddenSpace = (address: AnyAccountId) => {
  const isMySpace = isMyAddress(address)
  const { query: { spaceId } } = useRouter()
  const idOrHandle = spaceId as string

  const [ myHiddenSpace, setMyHiddenSpace ] = useState<SpaceData>()

  useSubsocialEffect(({ subsocial }) => {
    if (!isMySpace || isEmptyStr(idOrHandle)) return

    let isSubscribe = true

    const loadSpaceFromId = async () => {
      const id = await getSpaceId(idOrHandle, subsocial)
      const spaceData = id && await subsocial.findSpace({ id })
      isSubscribe && spaceData && setMyHiddenSpace(spaceData)
    }

    loadSpaceFromId()

    return () => { isSubscribe = false }
  }, [ isMySpace ])

  return {
    isLoading: !myHiddenSpace,
    myHiddenSpaces: myHiddenSpace
  }
}

export const NewSpaceButton = ({ children, ...buttonProps }: ButtonProps) => {
  const newSpacePath = '/spaces/new'
  return <ButtonLink href={newSpacePath} as={newSpacePath} {...buttonProps}>{children}</ButtonLink>
}
