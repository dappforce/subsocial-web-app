import React from 'react'
import moment from 'moment-timezone';
import { ViewSpace } from '../spaces/ViewSpace';
import { Pluralize } from '../utils/Plularize';
import { ProfileData, SpaceData, PostData, Activity, PostContent, EventsName } from '@subsocial/types';
import { hexToBn } from '@polkadot/util';
import BN from 'bn.js'
import Link from 'next/link';
import { nonEmptyStr } from '@subsocial/utils';
import { postUrl, spaceUrl } from '../urls';
import { NotifActivitiesType } from './Notifications';
import messages from '../../messages'
import { summarize } from 'src/utils';
import { isSharedPost } from '../posts/view-post';

export type LoadMoreFn = (
  myAddress: string,
  offset: number,
  limit: number
) => Promise<Activity[]>

export type EventsMsg = {
  [key in EventsName]: string;
};

export type PathLinks = {
  links: {
    href: string,
    as?: string
  }
}

export type NotificationType = PathLinks & {
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

type PreviewNotification = PathLinks & {
  preview: JSX.Element | null,
  image?: string,
  msg?: string,
}

const SUMMARIZE_LIMIT = 50

const renderSubjectPreview = (content?: PostContent, href: string = '') => {
  if (!content) return null

  const { title, body } = content
  const name = summarize(title || body || 'link', SUMMARIZE_LIMIT)
  return nonEmptyStr(name) || nonEmptyStr(href) ?
  <Link href='/[spaceId]/posts/[postId]' as={href}><a>{name}</a></Link>
  : null
}


const getSpacePreview = (spaceId: BN, map: Map<string, SpaceData>): PreviewNotification => {
  const data = map.get(spaceId.toString())
  return {
    preview: <ViewSpace spaceData={data} nameOnly withLink />,
    image: data?.content?.image,
    links: {
      href: '/[spaceId]',
      as: data && spaceUrl(data?.struct)
    }
  }
}

const getPostPreview = (postId: BN, spaceMap: Map<string, SpaceData>, postMap: Map<string, PostData>): PreviewNotification | undefined => {
  const data = postMap.get(postId.toString())
  console.log('DATA', data, data?.content?.title)

  if (!data) return undefined

  const isShared = isSharedPost(data.struct.extension)

  if (isShared) {
    const msg = messages['activities'].PostSharing
    const sharedPostId = data.struct.extension.asSharedPost
    const postPreview = getPostPreview(sharedPostId, spaceMap, postMap)
    return postPreview
      ? { ...postPreview, msg }
      : undefined
  }

  const spaceId = data?.struct.space_id.unwrapOr(undefined)
  const space = spaceId && spaceMap.get(spaceId.toString())?.struct
  const postLink = space && data && postUrl(space, data.struct)

  if (!postLink) return undefined

  const preview = renderSubjectPreview(data?.content, postLink)
  const image = data?.content?.image;
  return {
    preview,
    image,
    links: {
      href: '/[spaceId]/posts/[postId]',
      as: postLink
    }
  }
}

const getCommentPreview = (commentId: BN, spaceMap: Map<string, SpaceData>, postMap: Map<string, PostData>): PreviewNotification | undefined => {
  const commetIdStr = commentId.toString()
  const comment = postMap.get(commetIdStr);
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
    const data = postMap.get(root_post_id.toString())

    if (!data) return undefined

    const spaceId = data?.struct.space_id.unwrapOr(undefined)
    const space = spaceId && spaceMap.get(spaceId.toString())?.struct
    const postLink = space && data && postUrl(space, commentStruct)

    if (!postLink) return undefined

    const preview = renderSubjectPreview(data?.content, postLink)
    const image = data?.content?.image;
    return {
      preview,
      image,
      links: {
        href: '/[spaceId]/posts/[postId]',
        as: postLink
      }
    }

  }
  return undefined;
}

const getAtivityPreview = (activity: Activity, store: ActivityStore, type: NotifActivitiesType) => {
  const { event, space_id, post_id, comment_id } = activity;
  const { spaceById, postById } = store;

  const getCommentPreviewWithMaps = (comment_id: string) =>
    getCommentPreview(hexToBn(comment_id), spaceById, postById)

  const getPostPreviewWithMaps = (post_id: string) =>
    getPostPreview(hexToBn(post_id), spaceById, postById)

  const getSpacePreviewWithMaps = (space_id: string) =>
    getSpacePreview(hexToBn(space_id), spaceById)

  const isActivities = type === 'activities'

  switch (event) {
    case 'SpaceFollowed': return getSpacePreviewWithMaps(space_id)
    case 'SpaceCreated': return getSpacePreviewWithMaps(space_id)
    case 'CommentCreated': return getCommentPreviewWithMaps(comment_id)
    case 'CommentReplyCreated': return getCommentPreviewWithMaps(comment_id)
    case 'PostShared': return isActivities ? undefined : getPostPreviewWithMaps(post_id)
    case 'CommentShared': return getCommentPreviewWithMaps(comment_id)
    case 'PostReactionCreated': return getPostPreviewWithMaps(post_id)
    case 'CommentReactionCreated': return getCommentPreviewWithMaps(comment_id)
    case 'PostCreated': return isActivities ? getPostPreviewWithMaps(post_id) : undefined
  }

  return undefined
}

const getNotificationMessage = (msg: string, aggregationCount: number, preview: JSX.Element | null) => {
  const aggregationMsg = aggregationCount > 0 && <>{' and'} <Pluralize count={aggregationCount} singularText='other person' pluralText='other people' /></>;
  return <span className="DfActivityMsg">{aggregationMsg} {msg} {preview}</span>
}

export const getNotification = (activity: Activity, store: ActivityStore, type: NotifActivitiesType): NotificationType | undefined => {
  const { account, event, date, agg_count } = activity;
  const formatDate = moment(date).format('lll');
  const owner = store.ownerById.get(account);
  const activityPreview = getAtivityPreview(activity, store, type)

  if (!activityPreview) return undefined;

  const eventMsg = messages[type] as EventsMsg

  const { preview, msg = eventMsg[event as EventsName], ...other } = activityPreview

  const notificationMessage = getNotificationMessage(msg, agg_count, preview)

  return { address: account, notificationMessage, details: formatDate, owner, ...other }
}
