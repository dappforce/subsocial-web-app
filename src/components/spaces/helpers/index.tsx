import React, { useState } from 'react';
import { Menu, Dropdown } from 'antd';
import Link from 'next/link';
import { EllipsisOutlined, /* SettingOutlined, */ PlusOutlined } from '@ant-design/icons';
import { SpaceData, PostWithSomeDetails } from '@subsocial/types/dto'
import { Space, PostId } from '@subsocial/types/substrate/interfaces'
import { AnyAccountId } from '@subsocial/types/substrate'
import { isMyAddress } from 'src/components/auth/MyAccountContext';
import { editSpaceUrl, newPostUrl, HasSpaceIdOrHandle } from 'src/components/urls';
import HiddenSpaceButton from '../HiddenSpaceButton';
import { BareProps } from 'src/components/utils/types';
import { Pluralize } from 'src/components/utils/Plularize';
import PaginatedList from 'src/components/lists/PaginatedList';
import PostPreview from 'src/components/posts/view-post/PostPreview';
import useSubsocialEffect from 'src/components/api/useSubsocialEffect';
import { Loading } from 'src/components/utils';
import { isHidden } from '@subsocial/api/utils/visibility-filter'
import { ButtonProps } from 'antd/lib/button'
import NoData from 'src/components/utils/EmptyList';
import HiddenAlert, { BaseHiddenAlertProps } from 'src/components/utils/HiddenAlert';
import { useRouter } from 'next/router';
import { getSpaceId } from 'src/components/substrate';
import { isEmptyStr, isDef } from '@subsocial/utils';
import ButtonLink from 'src/components/utils/ButtonLink';
import BaseAvatar, { BaseAvatarProps } from 'src/components/utils/DfAvatar';
import ViewSpaceLink from '../ViewSpaceLink';
import DataList from 'src/components/lists/DataList';

type SpaceProps = {
  space: Space
}

type DropdownMenuProps = BareProps & {
  spaceData: SpaceData,
  vertical?: boolean
}

export const isMySpace = (space?: Space) => isDef(space) && isMyAddress(space.owner)

export const DropdownMenu = ({ spaceData: { struct }, vertical, style, className }: DropdownMenuProps) => {
  const { id } = struct

  const spaceKey = `space-${id.toString()}`

  const menu =
    <Menu>
      <Menu.Item key={`edit-space-${spaceKey}`}>
        <Link href={`/[spaceId]/edit`} as={editSpaceUrl(struct)}>
          <a className='item'>Edit space</a>
        </Link>
      </Menu.Item>
      {/* <Menu.Item key={`edit-nav-${spaceKey}`}>
        <EditMenuLink space={struct} className='item' />
      </Menu.Item> */}
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

  return isMySpace(struct)
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
      href='/[spaceId]/space-navigation/edit'
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
    ? <ButtonLink
      {...props}
      type='primary'
      icon={<PlusOutlined />}
      ghost
      href={'/[spaceId]/posts/new'}
      as={newPostUrl(space)}
    >
      {title}
    </ButtonLink>
    : null
}

type PostsOnSpacePageProps = {
  spaceData: SpaceData,
  postIds: PostId[],
  posts: PostWithSomeDetails[]
}

type LoadUnlistedPostByOwnerProps = {
  owner: AnyAccountId
  postIds: PostId[]
}

export const useLoadUnlistedPostByOwner = ({ owner, postIds }: LoadUnlistedPostByOwnerProps) => {
  const isMySpaces = isMyAddress(owner)
  const [ myHiddenPosts, setMyHiddenPosts ] = useState<PostWithSomeDetails[]>()

  useSubsocialEffect(({ subsocial }) => {
    if (!isMySpaces) return setMyHiddenPosts([])

    subsocial.findUnlistedPostsWithAllDetails(postIds)
      .then(setMyHiddenPosts)

  }, [ postIds.length, isMySpaces ])

  return {
    isLoading: !myHiddenPosts,
    myHiddenPosts: myHiddenPosts || []
  }
}

const HiddenPostList = ({ spaceData, postIds }: PostsOnSpacePageProps) => {
  const { struct: space } = spaceData
  const { myHiddenPosts, isLoading } = useLoadUnlistedPostByOwner({ owner: space.owner, postIds })

  if (isLoading) return <Loading />

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

export const PostPreviewsOnSpace = (props: PostsOnSpacePageProps) => {
  const { spaceData, posts, postIds } = props
  const { struct: space } = spaceData

  const postsSectionTitle = () =>
    <div className='w-100 d-flex justify-content-between align-items-baseline'>
      <span style={{ marginRight: '1rem' }}>
        <Pluralize count={posts.length} singularText='Post'/>
      </span>
      {posts.length > 0 && <CreatePostButton space={space} title={'Write Post'} className='mb-2' />}
    </div>

  const VisiblePostList = () => <PaginatedList
    title={postsSectionTitle()}
    dataSource={posts}
    totalCount={postIds.length}
    noDataDesc='No posts yet'
    noDataExt={isMySpace(space)
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

export const useLoadUnlistedSpace = (address: AnyAccountId) => {
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

export const CreateSpaceButton = ({
  children,
  type = 'primary',
  ghost = true,
  ...otherProps
}: ButtonProps) => {
  const props = { type, ghost, ...otherProps }
  const newSpacePath = '/spaces/new'
  return <ButtonLink href={newSpacePath} as={newSpacePath} {...props}>
    {children || <span><PlusOutlined /> Create space</span>}
  </ButtonLink>
}

type SpaceAvatarProps = BaseAvatarProps & {
  space: HasSpaceIdOrHandle
}

export const SpaceAvatar = (props: SpaceAvatarProps) => <ViewSpaceLink space={props.space} title={<BaseAvatar {...props} />} />

type AllSpacesLinkProps = BareProps & {
  title?: React.ReactNode
}

export const AllSpacesLink = ({ title = 'See all', ...otherProps }: AllSpacesLinkProps) => <Link href='/spaces/all' as='/spaces/all'>
  <a className='DfGreyLink text-uppercase' style={{ fontSize: '1rem' }} {...otherProps}>{title}</a>
</Link>
