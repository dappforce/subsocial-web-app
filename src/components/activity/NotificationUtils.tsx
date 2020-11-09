import React from 'react'
import moment from 'moment-timezone';
import { ViewSpace } from '../spaces/ViewSpace';
import { Pluralize } from '../utils/Plularize';
import { ProfileData, SpaceData, PostData, Activity, PostContent, EventsName, CommonStruct, AnySubsocialData, AnyAccountId } from '@subsocial/types';
import BN from 'bn.js'
import Link from 'next/link';
import { nonEmptyStr } from '@subsocial/utils';
import { postUrl, spaceUrl, accountUrl } from '../urls';
import { NotifActivitiesType } from './Notifications';
import messages from '../../messages'
import { summarize } from 'src/utils';
import { isSharedPost } from '../posts/view-post';
import AccountId from '@polkadot/types/generic/AccountId';
import { SocialAccount, Post } from '@subsocial/types/substrate/interfaces';
import { SubsocialApi } from '@subsocial/api/subsocial';
import { Name } from '../profiles/address-views/Name';

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
  owner: AnyAccountId,
  image?: string,
  msg?: string,
}

const SUMMARIZE_LIMIT = 50

type Struct = Exclude<CommonStruct, SocialAccount>

const fillArray = <T extends string | BN>(
  id: T,
  structIds: T[],
  structByIdMap: Map<string, AnySubsocialData>
) => {
  const struct = structByIdMap.get(id.toString())

  if (!struct) {
    structIds.push(id)
  }
}

type InnerNotificationsProps = {
  activityStore: ActivityStore,
  type: NotifActivitiesType,
  myAddress?: string
}

type LoadNotificationsProps = InnerNotificationsProps & {
  subsocial: SubsocialApi,
  activities: Activity[],
}

export const loadNotifications = async ({
  subsocial,
  activities,
  activityStore,
  type,
  myAddress
}: LoadNotificationsProps) => {
  const { spaceById, postById, ownerById } = activityStore

  const ownerIds: string[] = []
  const spaceIds: BN[] = []
  const postIds: BN[] = []

  activities.forEach(({ account, following_id, space_id, post_id, comment_id }) => {
    nonEmptyStr(account) && fillArray(account, ownerIds, ownerById)
    nonEmptyStr(following_id) && fillArray(following_id, ownerIds, ownerById)
    nonEmptyStr(space_id) && fillArray(new BN(space_id), spaceIds, spaceById)
    nonEmptyStr(post_id) && fillArray(new BN(post_id), postIds, postById)
    nonEmptyStr(comment_id) && fillArray(new BN(comment_id), postIds, postById)
  })

  const ownersData = await subsocial.findProfiles(ownerIds)
  const postsData = await subsocial.findPublicPosts(postIds)

  function fillMap<T extends AnySubsocialData> (
    data: T[],
    structByIdMap: Map<string, AnySubsocialData>,
    structName?: 'profile' | 'post'
  ) {
    data.forEach(x => {
      let id

      switch (structName) {
        case 'profile': {
          id = (x as ProfileData).profile?.created.account
          break
        }
        case 'post': {
          const struct = (x.struct as Post)
          id = struct.id
          const spaceId = struct.space_id.unwrapOr(undefined)
          spaceId && spaceIds.push(spaceId)
          break
        }
        default: {
          id = (x.struct as Struct).id
        }
      }

      if (id) {
        structByIdMap.set(id.toString(), x)
      }
    })
  }

  fillMap(postsData, postById, 'post'),
  fillMap(ownersData, ownerById, 'profile')

  // Only at this point we have ids of spaces that should be loaded:
  const spacesData = await subsocial.findPublicSpaces(spaceIds)
  fillMap(spacesData, spaceById)

  return activities
    .map(activity => getNotification({ activity, activityStore, myAddress, type }))
    .filter(x => x !== undefined) as NotificationType[]
}

const renderSubjectPreview = (content?: PostContent, href: string = '') => {
  if (!content) return null

  const { title, body } = content
  const name = summarize(title || body || 'link', SUMMARIZE_LIMIT)
  return nonEmptyStr(name) || nonEmptyStr(href) ?
  <Link href='/[spaceId]/posts/[postId]' as={href}><a>{name}</a></Link>
  : null
}


const getSpacePreview = (spaceId: BN, map: Map<string, SpaceData>): PreviewNotification | undefined  => {
  const data = map.get(spaceId.toString())

  if (!data) return undefined

  return {
    preview: <ViewSpace spaceData={data} nameOnly withLink />,
    image: data?.content?.image,
    owner: data?.struct.owner,
    links: {
      href: '/[spaceId]',
      as: data && spaceUrl(data?.struct)
    }
  }
}

const getAccountPreview = (accountId: string, map: Map<string, ProfileData>): PreviewNotification | undefined  => {
  const data = map.get(accountId)

  return {
    preview: <Name owner={data} address={accountId}/>,
    image: data?.content?.avatar,
    owner: accountId,
    links: {
      href: '/accounts/[address]',
      as: data && accountUrl({ address: accountId })
    }
  }
}

type GetPostPreviewProsp = {
  postId: BN,
  event: EventsName,
  spaceMap: Map<string, SpaceData>,
  postMap: Map<string, PostData>
}

const getPostPreview = ({ postId, postMap, spaceMap, event } :GetPostPreviewProsp): PreviewNotification | undefined => {
  const data = postMap.get(postId.toString())

  if (!data) return undefined

  const isShared = isSharedPost(data.struct.extension)

  if (event === 'PostCreated' && isShared) {
    const msg = messages['activities'].PostSharing
    const sharedPostId = data.struct.extension.asSharedPost
    const postPreview = getPostPreview({ postId: sharedPostId, spaceMap, postMap, event })
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
    owner: data.struct.owner,
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
      owner: data.struct.owner,
      links: {
        href: '/[spaceId]/posts/[postId]',
        as: postLink
      }
    }

  }
  return undefined;
}

const getAtivityPreview = (activity: Activity, store: ActivityStore, type: NotifActivitiesType) => {
  const { event, space_id, post_id, comment_id, following_id } = activity;
  const { spaceById, postById, ownerById } = store;
  const eventName = event as EventsName

  const getCommentPreviewWithMaps = (comment_id: string) =>
    getCommentPreview(new BN(comment_id), spaceById, postById)

  const getPostPreviewWithMaps = (post_id: string) =>
    getPostPreview({
      postId: new BN(post_id),
      spaceMap: spaceById,
      postMap: postById,
      event: eventName
    })

  const getSpacePreviewWithMaps = (space_id: string) =>
    getSpacePreview(new BN(space_id), spaceById)

  const isActivity = type === 'activities'

  switch (eventName) {
    case 'AccountFollowed': return getAccountPreview(following_id, ownerById)
    case 'SpaceFollowed': return getSpacePreviewWithMaps(space_id)
    case 'SpaceCreated': return getSpacePreviewWithMaps(space_id)
    case 'CommentCreated': return getCommentPreviewWithMaps(comment_id)
    case 'CommentReplyCreated': return getCommentPreviewWithMaps(comment_id)
    case 'PostShared': return isActivity ? undefined : getPostPreviewWithMaps(post_id)
    case 'CommentShared': return getCommentPreviewWithMaps(comment_id)
    case 'PostReactionCreated': return getPostPreviewWithMaps(post_id)
    case 'CommentReactionCreated': return getCommentPreviewWithMaps(comment_id)
    case 'PostCreated': return isActivity ? getPostPreviewWithMaps(post_id) : undefined
    default: return undefined
  }

}

const getNotificationMessage = (msg: string, aggregationCount: number, preview: JSX.Element | null, withAggregation: boolean) => {
  const aggregationMsg = withAggregation
    ? aggregationCount > 0 && <>{' and'} <Pluralize count={aggregationCount} singularText='other person' pluralText='other people' /></>
    : undefined;

  return <span className="DfActivityMsg">{aggregationMsg} {msg} {preview}</span>
}

type GetNotificationProps = InnerNotificationsProps & {
  activity: Activity,
}

export const getNotification = ({ type, activityStore, activity, myAddress }: GetNotificationProps): NotificationType | undefined => {
  const { account, event, date, agg_count } = activity;
  const formatDate = moment(date).format('lll');
  const creator = activityStore.ownerById.get(account);
  const activityPreview = getAtivityPreview(activity, activityStore, type)

  if (!activityPreview) return undefined;

  const { preview, msg, owner, ...other } = activityPreview
  const msgType: NotifActivitiesType = myAddress === owner.toString() ? 'notifications' : 'activities'
  const eventMsg = messages[msgType] as EventsMsg

  const notificationMessage = getNotificationMessage(msg || eventMsg[event as EventsName], agg_count, preview, type === 'notifications')

  return { address: account, notificationMessage, details: formatDate, owner: creator, ...other }
}
