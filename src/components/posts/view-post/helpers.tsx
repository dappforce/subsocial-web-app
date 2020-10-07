import React, { useState } from 'react';
import Link from 'next/link';
import { nonEmptyStr } from '@subsocial/utils';
import { formatUnixDate, IconWithLabel, isVisible } from '../../utils';
import { ViewSpace } from '../../spaces/ViewSpace';
import { DfBgImg } from '../../utils/DfBgImg';
import isEmpty from 'lodash.isempty';
import { EllipsisOutlined, MessageOutlined } from '@ant-design/icons';
import { Menu, Dropdown, Button } from 'antd';
import { isMyAddress } from '../../auth/MyAccountContext';
import { Post, Space, PostExtension, PostId } from '@subsocial/types/substrate/interfaces';
import { SpaceData, PostWithSomeDetails, PostWithAllDetails } from '@subsocial/types/dto';
import { PostContent as PostContentType } from '@subsocial/types';
import ViewTags from '../../utils/ViewTags';
import AuthorPreview from '../../profiles/address-views/AuthorPreview';
import SummarizeMd from '../../utils/md/SummarizeMd';
import ViewPostLink from '../ViewPostLink';
import HiddenPostButton from '../HiddenPostButton';
import HiddenAlert, { BaseHiddenAlertProps } from 'src/components/utils/HiddenAlert';
import NoData from 'src/components/utils/EmptyList';
import { VoterButtons } from 'src/components/voting/VoterButtons';
import Segment from 'src/components/utils/Segment';
import { RegularPreview, PostDetailsProps } from '.';
import { PostVoters, ActiveVoters } from 'src/components/voting/ListVoters';
import { isHidden } from '@subsocial/api/utils/visibility-filter';
import useSubsocialEffect from 'src/components/api/useSubsocialEffect';
import { PreviewProps } from './PostPreview';
import { Option } from '@polkadot/types'
import { resolveIpfsUrl } from 'src/ipfs';
import { useResponsiveSize } from 'src/components/responsive';
import { postUrl, editPostUrl, HasSpaceIdOrHandle, HasPostId } from 'src/components/urls';
import { ShareDropdown } from '../share/ShareDropdown';

type DropdownProps = {
  space: Space,
  post: Post
};

export const isRegularPost = (extension: PostExtension): boolean => extension.isRegularPost || (extension as any).RegularPost === null; // Hack because SSR serializes objects and this drops all methods.
export const isSharedPost = (extension: PostExtension): boolean => extension.isSharedPost || (extension as any).SharedPost;
export const isComment = (extension: PostExtension): boolean => extension.isComment || (extension as any).Comment;

type ReactionModalProps = {
  postId: PostId
}

const ReactionModal = ({ postId }: ReactionModalProps) => {
  const [ open, setOpen ] = useState(false)

  return <>
    <span onClick={() => setOpen(true)}>View reactions</span>
    <PostVoters id={postId} active={ActiveVoters.All} open={open} close={() => setOpen(false)} />
  </>
}

export const PostDropDownMenu: React.FunctionComponent<DropdownProps> = ({ space, post }) => {
  const isMyPost = isMyAddress(post.owner);
  const postId = post.id
  const postKey = `post-${postId.toString()}`

  const menu = (
    <Menu>
      {isMyPost && <Menu.Item key={`edit-${postKey}`}>
        <Link href='/[spaceId]/posts/[postId]/edit' as={editPostUrl(space, post)}>
          <a className='item'>Edit post</a>
        </Link>
      </Menu.Item>}
      {isMyPost && <Menu.Item key={`hidden-${postKey}`}>
        <HiddenPostButton post={post} asLink />
      </Menu.Item>}
      <Menu.Item key={`view-reaction-${postKey}`} >
        <ReactionModal postId={postId} />
      </Menu.Item>
      {/* {edit_history.length > 0 && <Menu.Item key='1'>
          <div onClick={() => setOpen(true)} >View edit history</div>
        </Menu.Item>} */}
    </Menu>
  );

  return <>
    <Dropdown overlay={menu} placement='bottomRight'>
      <EllipsisOutlined />
    </Dropdown>
    {/* open && <PostHistoryModal id={id} open={open} close={close} /> */}
  </>
};

type HiddenPostAlertProps = BaseHiddenAlertProps & {
  post: Post,
  space?: SpaceData
}

export const HiddenPostAlert = (props: HiddenPostAlertProps) => {
  const { post } = props
  const PostAlert = () => <HiddenAlert struct={post} type={isComment(post.extension) ? 'comment' : 'post'} {...props} />
  // TODO fix view Space alert when space is hidden
  // const SpaceAlert = () => space && !isOnlyVisible(space.struct) ? <HiddenAlert preview={preview} struct={space.struct} type='space' desc='This post is not visible because its space is hidden.' /> : null

  return <PostAlert />
}

export const renderPostLink = (space: HasSpaceIdOrHandle, post: HasPostId, title?: string) =>
  <ViewPostLink space={space} post={post} title={title} className='DfBlackLink' />

type PostNameProps = {
  space: HasSpaceIdOrHandle,
  post: HasPostId,
  title?: string,
  withLink?: boolean
}
export const PostName: React.FunctionComponent<PostNameProps> = ({ space, post, title, withLink }) => {
  if (!space?.id || !post?.id || !title) return null

  return (
    <div className={'header DfPostTitle--preview'}>
      {withLink ? renderPostLink(space, post, title) : title}
    </div>
  )
}

type PostCreatorProps = {
  postDetails: PostWithSomeDetails,
  withSpaceName: boolean,
  space?: SpaceData
  size?: number,
}

export const PostCreator: React.FunctionComponent<PostCreatorProps> = ({ postDetails, size, withSpaceName, space }) => {
  if (isEmpty(postDetails.post)) return null;
  const { post: { struct }, owner } = postDetails;
  const { created: { time }, owner: postOwnerAddress } = struct;
  // TODO replace on loaded space after refactor this components
  return <>
    <AuthorPreview
      address={postOwnerAddress}
      owner={owner}
      withFollowButton
      isShort={true}
      isPadded={false}
      size={size}
      details={<div>
        {withSpaceName && space && <><div className='DfGreyLink'><ViewSpace spaceData={space} nameOnly withLink /></div>{' • '}</>}
        {space && <Link href='/[spaceId]/posts/[postId]' as={postUrl(space.struct, struct)}>
          <a className='DfGreyLink'>
            {formatUnixDate(time)}
          </a>
        </Link>}
      </div>}
    />
  </>;
};

type PostImageProps = {
  content?: PostContentType
}

const PostImage = ({ content }: PostImageProps) => {
  if (!content) return null;

  const { isMobile } = useResponsiveSize()

  const { image } = content;

  return nonEmptyStr(image)
    ? <DfBgImg src={resolveIpfsUrl(image)} size={isMobile ? 100 : 160} className='DfPostImagePreview' /* add onError handler */ />
    : null
}

type PostContentProps = {
  postDetails: PostWithSomeDetails,
  space: Space,
  content?: PostContentType
}

export const PostContent: React.FunctionComponent<PostContentProps> = ({ postDetails, content, space }) => {
  if (!postDetails) return null;

  const { post: { struct: post } } = postDetails
  const postContent = content || postDetails.post.content;

  if (!postContent) return null;

  const { title, body } = postContent;
  return <div className='DfContent'>
    <PostName space={space} post={post} title={title} withLink />
    <SummarizeMd md={body} more={renderPostLink(space, post, 'See More')} />
  </div>
}

type PostActionsPanelProps = {
  postDetails: PostWithSomeDetails,
  space: Space,
  toogleCommentSection?: () => void,
  preview?: boolean,
  withBorder?: boolean
}

const ShowCommentsAction = ({ postDetails: { post: { struct: { replies_count } } }, preview, toogleCommentSection }: PostActionsPanelProps) => {
  const title = 'Comment'

  return <Action onClick={toogleCommentSection} title={title}>
    <IconWithLabel
      icon={<MessageOutlined />}
      count={replies_count}
      label={!preview ? title : undefined}
    />
  </Action>
}

const Action: React.FunctionComponent<{ onClick?: () => void, title?: string }> =
  ({ children, onClick, title }) =>
    <Button onClick={onClick} title={title} className='DfAction'>{children}</Button>

export const PostActionsPanel: React.FunctionComponent<PostActionsPanelProps> = (props) => {
  const { postDetails, space, preview, withBorder } = props
  const { post: { struct } } = postDetails;
  const ReactionsAction = () => <VoterButtons post={struct} className='DfAction' preview={preview} />
  return (
    <div className={`DfActionsPanel ${withBorder && 'DfActionBorder'}`}>
      {preview
        ? <ReactionsAction />
        : <div className='d-flex DfReactionsAction'>
          <ReactionsAction />
        </div>}
      {preview && <ShowCommentsAction {...props} />}
      <ShareDropdown postDetails={postDetails} space={space} className='DfAction' preview={preview} />
    </div>
  );
};

type InfoForPostPreviewProps = {
  postDetails: PostWithSomeDetails,
  space: SpaceData
}

type SharePostContentProps = {
  postDetails: PostWithSomeDetails,
  space: SpaceData
}

export const SharePostContent = ({ postDetails: { post: { struct, content }, ext }, space }: SharePostContentProps) => {
  const OriginalPost = () => {
    if (!ext || !ext.space) return <PostNotFound />

    const originalPost = ext.post.struct

    return <>
      {isVisible({ struct: originalPost, address: originalPost.owner })
        ? <RegularPreview postDetails={ext as PostWithAllDetails} space={ext.space} />
        : <PostNotFound />}
    </>
  }

  return <div className='DfSharedSummary'>
    <SummarizeMd md={content?.body} more={renderPostLink(space.struct, struct, 'See More')} />
    <Segment className='DfPostPreview'>
      <OriginalPost />
    </Segment>
  </div>
}

export const InfoPostPreview: React.FunctionComponent<InfoForPostPreviewProps> = ({ postDetails, space }) => {
  const { post: { struct, content } } = postDetails;
  if (!struct || !content) return null;
  return <div className='DfInfo'>
    <div className='DfRow'>
      <div className='w-100'>
        <div className='DfRow'>
          <PostCreator postDetails={postDetails} space={space} withSpaceName />
          <PostDropDownMenu post={struct} space={space.struct} />
        </div>
        <PostContent postDetails={postDetails} space={space.struct} />
        <ViewTags tags={content?.tags} />
        {/* {withStats && <StatsPanel id={post.id}/>} */}
      </div>
      <PostImage content={content} />
    </div>
  </div>
}

export const PostNotFound = () => <NoData description='Post not found' />

export const isHiddenPost = (post: Post) => isHidden(post)

export const useSubscribedPost = (initPost: Post) => {
  const [ post, setPost ] = useState(initPost)

  useSubsocialEffect(({ substrate: { api } }) => {
    let unsub: { (): void | undefined; (): void; };

    const sub = async () => {
      const readyApi = await api;
      unsub = await readyApi.query.posts.postById(post.id, (data: Option<Post>) => {
        setPost(data.unwrapOr(post));
      })
    }

    sub()

    return () => unsub && unsub()
  }, [])

  return post
}

export const withSubscribedPost = (Component: React.ComponentType<any>) => {
  return (props: PreviewProps | PostDetailsProps) => {
    const { postDetails } = props
    postDetails.post.struct = useSubscribedPost(postDetails.post.struct)

    return <Component {...props}/>
  }
}
