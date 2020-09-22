import React from 'react'
import moment from 'moment-timezone';
import ViewSpace from '../spaces/ViewSpace';
import { Pluralize } from '../utils/Plularize';
import { ProfileData, SpaceData, PostData, Activity } from '@subsocial/types';
import { hexToBn } from '@polkadot/util';
import BN from 'bn.js'
import Link from 'next/link';
import { nonEmptyStr } from '@subsocial/utils';
import { postUrl } from '../urls';

export type EventsName = 'AccountFollowed'|
'PostShared' | 'CommentShared' |
'SpaceFollowed' | 'SpaceCreated' |
'CommentCreated' | 'CommentReplyCreated'
| 'PostReactionCreated' | 'CommentReactionCreated'

export type EventsMsg = {
  [key in EventsName]: string;
};

export const eventsMsg: EventsMsg = {
  AccountFollowed: 'followed your account',
  PostShared: 'shared your post',
  CommentShared: 'shared your comment',
  SpaceFollowed: 'followed your space',
  SpaceCreated: 'created a new space',
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
  spaceById: Map<string, SpaceData>,
  postById: Map<string, PostData>,
  ownerById: Map<string, ProfileData>
}

type PreviewNotification = {
  preview: JSX.Element | null,
  image?: string,
  msg?: string
}

const renderSubjectPreview = (title?: string, href: string = '') =>
  nonEmptyStr(title) || nonEmptyStr(href) ? <Link href='/spaces/[spaceId]/posts/[postId]' as={href} ><a>{title}</a></Link> : null;

const getSpacePreview = (spaceId: BN, map: Map<string, SpaceData>): PreviewNotification => {
  const data = map.get(spaceId.toString())
  return { preview: <ViewSpace spaceData={data} nameOnly withLink /> }
}

const getPostPreview = (postId: BN, spaceMap: Map<string, SpaceData>, postMap: Map<string, PostData>): PreviewNotification => {
  const data = postMap.get(postId.toString())
  const spaceId = data?.struct.space_id.unwrapOr(undefined);
  const space = spaceId && spaceMap.get(spaceId.toString())?.struct
  const postLink = space && data && postUrl(space, data.struct)
  const preview = renderSubjectPreview(data?.content?.title, postLink)
  const image = data?.content?.image;
  return { preview, image }
}

const getCommentPreview = (commentId: BN, spaceMap: Map<string, SpaceData>, postMap: Map<string, PostData>): PreviewNotification | undefined => {
  const comment = postMap.get(commentId.toString());
  const commentStruct = comment?.struct;
  const isComment = commentStruct?.extension.isComment
  if (commentStruct && isComment) {
    const { root_post_id } = commentStruct.extension.asComment

    /* if (parent_id.isSome) {
      const msg = eventsMsg.CommentReactionCreated
      // const commentBody = comment?.content?.body || '';
      // const commentTitle = summarize(commentBody, 40)
      // const commentPreview = renderSubjectPreview(commentTitle, `/comment?postId=${commentStruct.post_id}&commentId=${commentStruct.id}`)
      // const { preview: postPreview, image } = getPostPreview(postId, postMap);
      // const preview = <>{commentPreview} in {postPreview}</>
      return { ...getPostPreview(root_post_id, spaceMap, postMap), msg }
    } */

    return getPostPreview(root_post_id, spaceMap, postMap);
  }
  return undefined;
}

const getAtivityPreview = (activity: Activity, store: ActivityStore) => {
  const { event, space_id, post_id, comment_id } = activity;
  const { spaceById, postById } = store;

  const getCommentPreviewWithMaps = (comment_id: string) =>
    getCommentPreview(hexToBn(comment_id), spaceById, postById)

  const getPostPreviewWithMaps = (post_id: string) =>
    getPostPreview(hexToBn(post_id), spaceById, postById)

  const getSpacePreviewWithMaps = (space_id: string) =>
    getSpacePreview(hexToBn(space_id), spaceById)

  switch (event) {
    case 'SpaceFollowed': return getSpacePreviewWithMaps(space_id)
    case 'SpaceCreated': return getSpacePreviewWithMaps(space_id)
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
