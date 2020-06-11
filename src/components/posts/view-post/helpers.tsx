import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { GenericAccountId as AccountId } from '@polkadot/types';
import { nonEmptyStr } from '@subsocial/utils';
import { formatUnixDate } from '../../utils/utils';
import ViewSpacePage from '../../spaces/ViewSpace';
import { DfBgImg } from '../../utils/DfBgImg';
import isEmpty from 'lodash.isempty';
import { isMobile } from 'react-device-detect';
import { Icon, Menu, Dropdown } from 'antd';
import { isMyAddress } from '../../auth/MyAccountContext';
import { Post, Space, PostExtension } from '@subsocial/types/substrate/interfaces';
import { SpaceData, PostWithSomeDetails } from '@subsocial/types/dto';
import { PostExtContent } from '../LoadPostUtils'
import ViewTags from '../../utils/ViewTags';
import AuthorPreview from '../../profiles/address-views/AuthorPreview';
import SummarizeMd from '../../utils/md/SummarizeMd';
import ViewPostLink from '../ViewPostLink';
import { HasSpaceIdOrHandle, HasPostId, postUrl } from '../../utils/urls';
import SharePostAction from '../SharePostAction';

const Voter = dynamic(() => import('../../voting/Voter'), { ssr: false });

type DropdownProps = {
  account: string | AccountId;
  space: Space,
  post: Post
};

export const isRegularPost = (extension: PostExtension) => !(extension.isSharedPost || (extension as any).SharedPost); // hack because SSR don`t undestand methods, only object

export const PostDropDownMenu: React.FunctionComponent<DropdownProps> = ({ account, space, post }) => {
  const isMyPost = isMyAddress(account);

  const menu = (
    <Menu>
      {isMyPost && <Menu.Item key='0'>
        <Link href='/spaces/[spaceId]/posts/[postId]/edit' as={postUrl(space, post, '/edit')}>
          <a className='item'>Edit</a>
        </Link>
      </Menu.Item>}
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
  postStruct: PostWithSomeDetails,
  withSpaceName: boolean,
  space?: SpaceData
  size?: number,
}

export const PostCreator: React.FunctionComponent<PostCreatorProps> = ({ postStruct, size, withSpaceName, space }) => {
  if (isEmpty(postStruct.post)) return null;
  const { post: { struct }, owner } = postStruct;
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

const renderPostImage = (content?: PostExtContent) => {
  if (!content) return null;

  const { image } = content;

  return nonEmptyStr(image) &&
      <DfBgImg src={image} size={isMobile ? 100 : 160} className='DfPostImagePreview' /* add onError handler */ />
}

type PostContentProps = {
  postStruct: PostWithSomeDetails,
  space: Space,
  content?: PostExtContent
}

export const PostContent: React.FunctionComponent<PostContentProps> = ({ postStruct, content, space }) => {
  if (!postStruct) return null;

  const { post: { struct: post } } = postStruct
  const postContent = content || postStruct.post.content;

  if (!postContent) return null;

  const { title, body } = postContent;
  return <div className='DfContent'>
    <PostName space={space} post={post} title={title} withLink />
    <SummarizeMd md={body} more={renderPostLink(space, post, 'See More')} />
  </div>
}

type PostActionsPanelProps = {
  postStruct: PostWithSomeDetails,
  toogleCommentSection?: () => void
}

export const PostActionsPanel: React.FunctionComponent<PostActionsPanelProps> = ({ postStruct, toogleCommentSection }) => {
  const { post: { struct }, ext } = postStruct;
  const { extension, id } = struct
  const postId = isRegularPost(extension as PostExtension) ? id : ext && ext.post.struct.id
  const actionClass = 'ui tiny button basic DfAction'

  return (
    <div className='DfActionsPanel'>
      <div className='DfAction'>
        <Voter struct={struct} />
      </div>
      <div className={actionClass} onClick={toogleCommentSection}>
        <Icon type='message' />
          Comment
      </div>
      <SharePostAction postId={postId} className={actionClass} />
    </div>
  );
};

type InfoForPostPreviewProps = {
  postStruct: PostWithSomeDetails,
  space: SpaceData
}

export const InfoPostPreview: React.FunctionComponent<InfoForPostPreviewProps> = ({ postStruct, space }) => {
  const { post: { struct, content } } = postStruct;
  if (!struct || !content) return null;
  return <div className='DfInfo'>
    <div className='DfRow'>
      <div>
        <div className='DfRow'>
          <PostCreator postStruct={postStruct} space={space} withSpaceName />
          <PostDropDownMenu account={struct.created.account} post={struct} space={space.struct} />
        </div>
        <PostContent postStruct={postStruct} space={space.struct} />
        <ViewTags tags={content?.tags} />
        {/* {withStats && <StatsPanel id={post.id}/>} */}
      </div>
      <div>
        {renderPostImage(content)}
      </div>
    </div>
  </div>
}
