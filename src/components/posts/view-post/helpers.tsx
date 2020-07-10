import React, { useState } from 'react';
import Link from 'next/link';
import { GenericAccountId as AccountId } from '@polkadot/types';
import { nonEmptyStr } from '@subsocial/utils';
import { formatUnixDate, IconWithLabel, isVisible } from '../../utils';
import ViewSpacePage from '../../spaces/ViewSpace';
import { DfBgImg } from '../../utils/DfBgImg';
import isEmpty from 'lodash.isempty';
import { isMobile } from 'react-device-detect';
import { Icon, Menu, Dropdown, Button } from 'antd';
import { isMyAddress } from '../../auth/MyAccountContext';
import { Post, Space, PostExtension, PostId } from '@subsocial/types/substrate/interfaces';
import { SpaceData, PostWithSomeDetails, PostWithAllDetails } from '@subsocial/types/dto';
import { PostContent as PostContentType } from '@subsocial/types';
import ViewTags from '../../utils/ViewTags';
import AuthorPreview from '../../profiles/address-views/AuthorPreview';
import SummarizeMd from '../../utils/md/SummarizeMd';
import ViewPostLink from '../ViewPostLink';
import { HasSpaceIdOrHandle, HasPostId, postUrl } from '../../utils/urls';
import SharePostAction from '../SharePostAction';
import HiddenPostButton from '../HiddenPostButton';
import HiddenAlert from 'src/components/utils/HiddenAlert';
import NoData from 'src/components/utils/EmptyList';
import { VoterButtons } from 'src/components/voting/VoterButtons';
import Segment from 'src/components/utils/Segment';
import { RegularPreview } from '.';
import { PostVoters, ActiveVoters } from 'src/components/voting/ListVoters';

type DropdownProps = {
  account: string | AccountId;
  space: Space,
  post: Post
};

export const isRegularPost = (extension: PostExtension) => extension.isRegularPost || (extension as any).RegularPost === null; // hack because SSR don`t undestand methods, only object
export const isSharedPost = (extension: PostExtension) => extension.isSharedPost || (extension as any).SharedPost;
export const isComment = (extension: PostExtension) => extension.isComment || (extension as any).Comment;

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

export const PostDropDownMenu: React.FunctionComponent<DropdownProps> = ({ account, space, post }) => {
  const isMyPost = isMyAddress(account);
  const postId = post.id
  const postKey = `post-${postId.toString()}`

  const menu = (
    <Menu>
      {isMyPost && <Menu.Item key={`edit-${postKey}`}>
        <Link href='/spaces/[spaceId]/posts/[postId]/edit' as={postUrl(space, post, '/edit')}>
          <a className='item'>Edit</a>
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
    {isMyPost &&
        <Dropdown overlay={menu} placement='bottomRight'>
          <Icon type='ellipsis' />
        </Dropdown>
    }
    {/* open && <PostHistoryModal id={id} open={open} close={close} /> */}
  </>
};

type HiddenPostAlertProps = {
  post: PostWithSomeDetails,
  onSpacePage?: boolean
}

export const HiddenPostAlert = ({ post: { post, ext, space }, onSpacePage = false }: HiddenPostAlertProps) => {
  const PostAlert = () => <HiddenAlert struct={post.struct} type='post' />
  const ParentPostAlert = () => ext ? <HiddenAlert struct={ext.post.struct} type='post' desc='This post is not visible because parent post is hidden.' /> : null
  const SpaceAlert = () => space && !onSpacePage ? <HiddenAlert struct={space.struct} type='space' desc='This post is not visible because its space is hidden.' /> : null

  return <PostAlert /> || <ParentPostAlert /> || <SpaceAlert />
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
  const { created: { account, time } } = struct;
  // TODO replace on loaded space after refactor this components
  return <>
    <AuthorPreview
      address={account}
      owner={owner}
      withFollowButton
      isShort={true}
      isPadded={false}
      size={size}
      details={<div>
        {withSpaceName && space && <><div className='DfGreyLink'><ViewSpacePage spaceData={space} nameOnly withLink /></div>{' • '}</>}
        {space && <Link href={postUrl(space.struct, struct)}>
          <a className='DfGreyLink'>
            {formatUnixDate(time)}
          </a>
        </Link>}
      </div>}
    />
  </>;
};

const renderPostImage = (content?: PostContentType) => {
  if (!content) return null;

  const { image } = content;

  return nonEmptyStr(image) &&
    <DfBgImg src={image} size={isMobile ? 100 : 160} className='DfPostImagePreview' /* add onError handler */ />
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
  toogleCommentSection?: () => void,
  preview?: boolean,
  withBorder?: boolean
}

const ShowCommentsAction = ({ postDetails: { post: { struct: { total_replies_count } } }, preview, toogleCommentSection }: PostActionsPanelProps) => {
  const title = 'Comment'

  return <Action onClick={toogleCommentSection} title={title}>
    <IconWithLabel icon='message' count={total_replies_count} label={!preview ? title : undefined} />
  </Action>
}

const Action: React.FunctionComponent<{ onClick?: () => void, title?: string }> =
  ({ children, onClick, title }) =>
    <Button onClick={onClick} title={title} className='DfAction'>{children}</Button>

export const PostActionsPanel: React.FunctionComponent<PostActionsPanelProps> = (props) => {
  const { postDetails, preview, withBorder } = props
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
      <SharePostAction postDetails={postDetails} className='DfAction' preview={preview} />
    </div>
  );
};

type InfoForPostPreviewProps = {
  postDetails: PostWithSomeDetails,
  space: SpaceData
}

type SharePostContentProps = {
  postDetails: PostWithAllDetails,
  space: SpaceData
}

export const SharePostContent = ({ postDetails: { post: { content }, ext }, space }: SharePostContentProps) => {
  if (!ext) return null

  const { post: { struct: originalPost } } = ext;

  return <> <div className='DfSharedSummary'>
    <SummarizeMd md={content?.body} more={renderPostLink(space.struct, originalPost, 'See More')} />
  </div>
  <Segment className='DfPostPreview'>
    {isVisible({ struct: originalPost, address: originalPost.created.account })
      ? <RegularPreview postDetails={ext as PostWithAllDetails} space={space} />
      : <PostNotFound />}
  </Segment>
  </>
}

export const InfoPostPreview: React.FunctionComponent<InfoForPostPreviewProps> = ({ postDetails, space }) => {
  const { post: { struct, content } } = postDetails;
  if (!struct || !content) return null;
  return <div className='DfInfo'>
    <div className='DfRow'>
      <div>
        <div className='DfRow'>
          <PostCreator postDetails={postDetails} space={space} withSpaceName />
          <PostDropDownMenu account={struct.created.account} post={struct} space={space.struct} />
        </div>
        <PostContent postDetails={postDetails} space={space.struct} />
        <ViewTags tags={content?.tags} />
        {/* {withStats && <StatsPanel id={post.id}/>} */}
      </div>
      <div>
        {renderPostImage(content)}
      </div>
    </div>
  </div>
}

export const PostNotFound = () => <NoData description='Post not found' />
