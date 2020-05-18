import React from 'react'
import moment from 'moment-timezone';
import ViewBlogPage from '../blogs/ViewBlog';
import { Pluralize } from '../utils/Plularize';
import { ProfileData, BlogData, PostData, Activity } from '@subsocial/types';
import { hexToBn } from '@polkadot/util';
import BN from 'bn.js'
import Link from 'next/link';
import { nonEmptyStr } from '@subsocial/utils';

export type EventsName = 'AccountFollowed' | 'PostShared' | 'CommentShared' | 'BlogFollowed' | 'BlogCreated' | 'CommentCreated' | 'CommentReply' | 'PostReactionCreated' | 'PostReactionCreated' | 'CommentReactionCreated'

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
  CommentReply: 'replied to your comment',
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
  blogByBlogIdMap: Map<string, BlogData>,
  postByPostIdMap: Map<string, PostData>,
  ownerDataByOwnerIdMap: Map<string, ProfileData>
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

const getPostPreview = (postId: BN, map: Map<string, PostData>): PreviewNotification => {
  const data = map.get(postId.toString())
  const preview = renderSubjectPreview(data?.content?.title, `/blogs/${data?.struct.blog_id}/posts/${data?.struct.id}`)
  const image = data?.content?.image;
  return { preview, image }
}

const getCommentPreview = (commentId: BN, postMap: Map<string, PostData>): PreviewNotification | undefined => {
  const comment = postMap.get(commentId.toString());
  const commentStruct = comment?.struct;
  const isCommentExt = commentStruct?.extension.isComment
  if (commentStruct && isCommentExt) {
    const { parent_id, root_post_id } = commentStruct.extension.asComment

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
  const { blogByBlogIdMap, postByPostIdMap } = store;

  switch (event) {
    case 'BlogFollowed': return getBlogPreview(hexToBn(blog_id), blogByBlogIdMap)
    case 'BlogCreated': return getBlogPreview(hexToBn(blog_id), blogByBlogIdMap)
    case 'CommentCreated': return getCommentPreview(hexToBn(comment_id), postByPostIdMap)
    case 'PostShared': return getPostPreview(hexToBn(post_id), postByPostIdMap)
    case 'CommentShared': return getPostPreview(hexToBn(comment_id), postByPostIdMap)
    case 'PostReactionCreated': return getPostPreview(hexToBn(post_id), postByPostIdMap)
    case 'CommentReactionCreated': return getCommentPreview(hexToBn(comment_id), postByPostIdMap)
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
  const owner = store.ownerDataByOwnerIdMap.get(account);
  const activityPreview = getAtivityPreview(activity, store)

  if (!activityPreview) return undefined;

  const { preview, image, msg = eventsMsg[(event as EventsName)] } = activityPreview

  const notificationMessage = getNotificationMessage(msg, agg_count, preview)

  return { address: account, notificationMessage, details: formatDate, image, owner }
}
