import React from 'react'
import moment from 'moment-timezone';
import ViewBlogPage from '../blogs/ViewBlog';
import { Pluralize } from '../utils/Plularize';
import { ProfileData, BlogData, PostData, Activity } from '@subsocial/types';
import { hexToBn } from '@polkadot/util';
import BN from 'bn.js'
import Link from 'next/link';
import { nonEmptyStr } from '@subsocial/utils';
import { postUrl } from '../utils/urls';

export type EventsName = 'AccountFollowed'|
'PostShared' | 'CommentShared' |
'BlogFollowed' | 'BlogCreated' |
'CommentCreated' | 'CommentReplyCreated'
| 'PostReactionCreated' | 'CommentReactionCreated'

export type EventsMsg = {
  [key in EventsName]: string;
};

export const eventsMsg: EventsMsg = {
  AccountFollowed: 'followed your account',
  PostShared: 'shared your post',
  CommentShared: 'shared your comment',
  BlogFollowed: 'followed your blog',
  BlogCreated: 'created a new blog',
  CommentCreated: 'commented on your post',
  CommentReplyCreated: 'replied to your comment',
  PostReactionCreated: 'reacted to your post',
  CommentReactionCreated: 'reacted to your comment'
}

export type NotificationType = {
  address: string
  notificationMessage: React.ReactNode,
  details?: string,
  owner?: ProfileData
  image?: string
}

export type ActivityStore = {
  blogById: Map<string, BlogData>,
  postById: Map<string, PostData>,
  ownerById: Map<string, ProfileData>
}

type PreviewNotification = {
  preview: JSX.Element | null,
  image?: string,
  msg?: string
}

const renderSubjectPreview = (title?: string, href: string = '') =>
  nonEmptyStr(title) || nonEmptyStr(href) ? <Link href={href} ><a>{title}</a></Link> : null;

const getBlogPreview = (blogId: BN, map: Map<string, BlogData>): PreviewNotification => {
  const data = map.get(blogId.toString())
  return { preview: <ViewBlogPage blogData={data} nameOnly withLink /> }
}

const getPostPreview = (postId: BN, blogMap: Map<string, BlogData>, postMap: Map<string, PostData>): PreviewNotification => {
  const data = postMap.get(postId.toString())
  const blogId = data?.struct.blog_id.unwrapOr(undefined);
  const blog = blogId && blogMap.get(blogId.toString())?.struct
  const postLink = blog && data && postUrl(blog, data.struct)
  const preview = renderSubjectPreview(data?.content?.title, postLink)
  const image = data?.content?.image;
  return { preview, image }
}

const getCommentPreview = (commentId: BN, blogMap: Map<string, BlogData>, postMap: Map<string, PostData>): PreviewNotification | undefined => {
  const comment = postMap.get(commentId.toString());
  const commentStruct = comment?.struct;
  const isCommentExt = commentStruct?.extension.isComment
  if (commentStruct && isCommentExt) {
    const { root_post_id } = commentStruct.extension.asComment

    if (parent_id.isSome) {
      const msg = eventsMsg.CommentReactionCreated
      // const commentBody = comment?.content?.body || '';
      // const commentTitle = summarize(commentBody, 40)
      // const commentPreview = renderSubjectPreview(commentTitle, `/comment?postId=${commentStruct.post_id}&commentId=${commentStruct.id}`)
      // const { preview: postPreview, image } = getPostPreview(postId, postMap);
      // const preview = <>{commentPreview} in {postPreview}</>
      return { ...getPostPreview(root_post_id, postMap), msg }
    }

    return getPostPreview(root_post_id, postMap);
  }
  return undefined;
}

const getAtivityPreview = (activity: Activity, store: ActivityStore) => {
  const { event, blog_id, post_id, comment_id } = activity;
  const { blogById, postById } = store;

  const getCommentPreviewWithMaps = (comment_id: string) =>
    getCommentPreview(hexToBn(comment_id), blogById, postById)

  const getPostPreviewWithMaps = (post_id: string) =>
    getPostPreview(hexToBn(post_id), blogById, postById)

  const getBlogPreviewWithMaps = (blog_id: string) =>
    getBlogPreview(hexToBn(blog_id), blogById)

  switch (event) {
    case 'BlogFollowed': return getBlogPreviewWithMaps(blog_id)
    case 'BlogCreated': return getBlogPreviewWithMaps(blog_id)
    case 'CommentCreated': return getCommentPreviewWithMaps(comment_id)
    case 'CommentReplyCreated': return getCommentPreviewWithMaps(comment_id)
    case 'PostShared': return getPostPreviewWithMaps(post_id)
    case 'CommentShared': return getCommentPreviewWithMaps(comment_id)
    case 'PostReactionCreated': return getPostPreviewWithMaps(post_id)
    case 'CommentReactionCreated': return getCommentPreviewWithMaps(comment_id)
  }

  return undefined
}

const getNotificationMessage = (msg: string, aggregationCount: number, preview: JSX.Element | null) => {
  const aggregationMsg = aggregationCount > 0 && <>{' and'} <Pluralize count={aggregationCount} singularText='other person' pluralText='other people' /></>;
  return <span className="DfActivityMsg">{aggregationMsg} {msg} {preview}</span>
}

export const getNotification = (activity: Activity, store: ActivityStore): NotificationType | undefined => {
  const { account, event, date, agg_count } = activity;
  const formatDate = moment(date).format('lll');
  const owner = store.ownerById.get(account);
  const activityPreview = getAtivityPreview(activity, store)

  if (!activityPreview) return undefined;

  const { preview, image, msg = eventsMsg[(event as EventsName)] } = activityPreview

  const notificationMessage = getNotificationMessage(msg, agg_count, preview)

  return { address: account, notificationMessage, details: formatDate, image, owner }
}
