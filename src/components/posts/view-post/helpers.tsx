import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { GenericAccountId as AccountId } from '@polkadot/types';
import { nonEmptyStr } from '@subsocial/utils';
import { formatUnixDate } from '../../utils/utils';
import ViewBlogPage from '../../blogs/ViewBlog';
import { DfBgImg } from '../../utils/DfBgImg';
import isEmpty from 'lodash.isempty';
import { isMobile } from 'react-device-detect';
import { Icon, Menu, Dropdown } from 'antd';
import { isMyAddress } from '../../utils/MyAccountContext';
import { Post, Blog } from '@subsocial/types/substrate/interfaces';
import { BlogData, PostWithSomeDetails } from '@subsocial/types/dto';
import { PostExtContent } from '../LoadPostUtils'
import ViewTags from '../../utils/ViewTags';
import AuthorPreview from '../../profiles/address-views/AuthorPreview';
import SummarizeMd from '../../utils/md/SummarizeMd';
import ViewPostLink from '../ViewPostLink';
import { HasBlogIdOrHandle, HasPostId, postUrl } from '../../utils/urls';
import SharePostAction from '../SharePostAction';
import { PostExtension } from '@subsocial/types/substrate/classes';

const Voter = dynamic(() => import('../../voting/Voter'), { ssr: false });

type DropdownProps = {
  account: string | AccountId;
  blog: Blog,
  post: Post
};

export const isRegularPost = (extension: PostExtension) => !(extension.isSharedPost || (extension as any).SharedPost); // hack because SSR don`t undestand methods, only object

export const PostDropDownMenu: React.FunctionComponent<DropdownProps> = ({ account, blog, post }) => {
  const isMyPost = isMyAddress(account);

  const menu = (
    <Menu>
      {isMyPost && <Menu.Item key='0'>
        <Link href='/blogs/[blogId]/posts/[postId]/edit' as={postUrl(blog, post)}>
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

export const renderPostLink = (blog: HasBlogIdOrHandle, post: HasPostId, title?: string) =>
  <ViewPostLink blog={blog} post={post} title={title} className='DfBlackLink' />

type PostNameProps = {
  blog: HasBlogIdOrHandle,
  post: HasPostId,
  title?: string,
  withLink?: boolean
}
export const PostName: React.FunctionComponent<PostNameProps> = ({ blog, post, title, withLink }) => {
  if (!blog?.id || !post?.id || !title) return null

  return (
    <div className={'header DfPostTitle--preview'}>
      {withLink ? renderPostLink(blog, post, title) : title}
    </div>
  )
}

type PostCreatorProps = {
  postStruct: PostWithSomeDetails,
  withBlogName: boolean,
  blog?: BlogData
  size?: number,
}

export const PostCreator: React.FunctionComponent<PostCreatorProps> = ({ postStruct, size, withBlogName, blog }) => {
  if (isEmpty(postStruct.post)) return null;
  const { post: { struct }, owner } = postStruct;
  const { created: { account, time } } = struct;
  // TODO replace on loaded blog after refactor this components
  return <>
    <AuthorPreview
      address={account}
      owner={owner}
      withFollowButton
      isShort={true}
      isPadded={false}
      size={size}
      details={<div>
        {withBlogName && blog && <><div className='DfGreyLink'><ViewBlogPage blogData={blog} nameOnly withLink /></div>{' • '}</>}
        {blog && <Link href={postUrl(blog.struct, struct)}>
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
  blog: Blog,
  content?: PostExtContent
}

export const PostContent: React.FunctionComponent<PostContentProps> = ({ postStruct, content, blog }) => {
  if (!postStruct || !content) return null;

  const { post: { struct: post } } = postStruct
  const { title, body } = content || postStruct.post.content;

  return <div className='DfContent'>
    <PostName blog={blog} post={post} title={title} />
    <SummarizeMd md={body} more={renderPostLink(blog, post, 'See More')} />
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
  blog: BlogData
}

export const InfoPostPreview: React.FunctionComponent<InfoForPostPreviewProps> = ({ postStruct, blog }) => {
  const { post: { struct, content } } = postStruct;
  if (!struct || !content) return null;
  return <div className='DfInfo'>
    <div className='DfRow'>
      <div>
        <div className='DfRow'>
          <PostCreator postStruct={postStruct} blog={blog} withBlogName />
          <PostDropDownMenu account={struct.created.account} post={struct} blog={blog.struct} />
        </div>
        <PostContent postStruct={postStruct} blog={blog.struct} />
        <ViewTags tags={content?.tags} />
        {/* {withStats && <StatsPanel id={post.id}/>} */}
      </div>
      <div>
        {renderPostImage(content)}
      </div>
    </div>
  </div>
}
