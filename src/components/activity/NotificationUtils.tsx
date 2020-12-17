import React from 'react'
import dayjs from 'dayjs'
import { ViewSpace } from '../spaces/ViewSpace'
import { Pluralize } from '../utils/Plularize'
import { Activity, EventsName, PostContent, AnyAccountId } from '@subsocial/types'
import { ProfileData, SpaceData, PostData, asSharedPostStruct, PostId, asCommentStruct, SpaceId, AccountId, EntityId } from 'src/types'
import BN from 'bn.js'
import Link from 'next/link'
import { nonEmptyStr } from '@subsocial/utils'
import { postUrl, spaceUrl, accountUrl } from '../urls'
import { NotifActivitiesType } from './Notifications'
import messages from '../../messages'
import { summarize } from 'src/utils'
import { Name } from '../profiles/address-views/Name'
import { equalAddresses, FlatSubsocialApi } from '../substrate'

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
  id: string
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

type AnyEntityData = SpaceData | PostData | ProfileData

const rememberEntityId = (
  id: EntityId,
  structIds: EntityId[],
  structByIdMap: Map<EntityId, AnyEntityData>
) => {
  if (structByIdMap.has(id)) {
    structIds.push(id)
  }
}

type InnerNotificationsProps = {
  activityStore: ActivityStore,
  type: NotifActivitiesType,
  myAddress?: string
}

type LoadNotificationsProps = InnerNotificationsProps & {
  flatApi: FlatSubsocialApi,
  activities: Activity[],
}

export const loadNotifications = async ({
  flatApi,
  activities,
  activityStore,
  type,
  myAddress
}: LoadNotificationsProps) => {
  const { spaceById, postById, ownerById } = activityStore

  const ownerIds: AccountId[] = []
  const spaceIds: SpaceId[] = []
  const postIds: PostId[] = []

  activities.forEach(({ account, following_id, space_id, post_id, comment_id }) => {
    nonEmptyStr(account) && rememberEntityId(account, ownerIds, ownerById)
    nonEmptyStr(following_id) && rememberEntityId(following_id, ownerIds, ownerById)
    nonEmptyStr(space_id) && rememberEntityId(space_id, spaceIds, spaceById)
    nonEmptyStr(post_id) && rememberEntityId(post_id, postIds, postById)
    nonEmptyStr(comment_id) && rememberEntityId(comment_id, postIds, postById)
  })

  // TODO use redux
  const ownersData = await flatApi.findProfiles(ownerIds)
  const postsData = await flatApi.findPublicPosts(postIds)

  function fillMap<T extends AnyEntityData> (
    data: T[],
    structByIdMap: Map<string, T>,
    structName?: 'profile' | 'post'
  ) {
    data.forEach(x => {
      let id: EntityId

      switch (structName) {
        case 'profile': {
          id = (x as ProfileData).id
          break
        }
        case 'post': {
          const struct = (x as PostData).struct
          id = struct.id
          const { spaceId } = struct
          spaceId && spaceIds.push(spaceId)
          break
        }
        default: {
          id = (x as SpaceData).id
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
  const spacesData = await flatApi.findPublicSpaces(spaceIds)
  fillMap(spacesData, spaceById)

  return activities
    .map(activity => getNotification({ activity, activityStore, myAddress, type }))
    .filter(x => x !== undefined) as NotificationType[]
}

const renderSubjectPreview = (content?: PostContent, href = '') => {
  if (!content) return null

  const { title, body } = content
  const name = summarize(title || body || 'link', { limit: SUMMARIZE_LIMIT })
  return nonEmptyStr(name) || nonEmptyStr(href) ?
  <Link href='/[spaceId]/[slug]' as={href}><a>{name}</a></Link>
  : null
}


const getSpacePreview = (spaceId: SpaceId, map: Map<string, SpaceData>): PreviewNotification | undefined => {
  const data = map.get(spaceId.toString())

  if (!data) return undefined

  return {
    preview: <ViewSpace spaceData={data} nameOnly withLink />,
    image: data?.content?.image,
    owner: data?.struct.ownerId,
    links: {
      href: '/[spaceId]',
      as: data && spaceUrl(data?.struct)
    }
  }
}

const getAccountPreview = (accountId: string, map: Map<string, ProfileData>): PreviewNotification | undefined => {
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
  postId: PostId,
  event: EventsName,
  spaceMap: Map<string, SpaceData>,
  postMap: Map<string, PostData>
}

const getPostPreview = ({ postId, postMap, spaceMap, event } :GetPostPreviewProsp): PreviewNotification | undefined => {
  const data = postMap.get(postId)

  if (!data) return undefined

  const { isSharedPost } = data.struct

  if (isSharedPost && event === 'PostCreated') {
    const msg = messages['activities'].PostSharing
    const { sharedPostId } = asSharedPostStruct(data.struct)
    const postPreview = getPostPreview({ postId: sharedPostId, spaceMap, postMap, event })

    return postPreview
      ? { ...postPreview, msg }
      : undefined
  }

  const spaceId = data?.struct.spaceId
  const space = spaceId && spaceMap.get(spaceId)?.struct
  const postLink = space && data && postUrl(space, data)

  if (!postLink) return undefined

  const preview = renderSubjectPreview(data?.content, postLink)
  const image = data?.content?.image

  return {
    preview,
    image,
    owner: data.struct.ownerId,
    links: {
      href: '/[spaceId]/[slug]',
      as: postLink
    }
  }
}

const getCommentPreview = (commentId: BN, spaceMap: Map<string, SpaceData>, postMap: Map<string, PostData>): PreviewNotification | undefined => {
  const commetIdStr = commentId.toString()
  const comment = postMap.get(commetIdStr)
  const commentStruct = comment?.struct
  const isComment = commentStruct?.isComment === true

  if (comment && commentStruct && isComment) {
    const { rootPostId } = asCommentStruct(commentStruct)

    /* if (parent_id.isSome) {
      const msg = eventsMsg.CommentReactionCreated
      // const commentBody = comment?.content?.body || '';
      // const commentTitle = summarize(commentBody, 40)
      // const commentPreview = renderSubjectPreview(commentTitle, `/comment?postId=${commentStruct.post_id}&commentId=${commentStruct.id}`)
      // const { preview: postPreview, image } = getPostPreview(postId, postMap);
      // const preview = <>{commentPreview} in {postPreview}</>
      return { ...getPostPreview(rootPostId, spaceMap, postMap), msg }
    } */

    const data = postMap.get(rootPostId)

    if (!data) return undefined

    const spaceId = data?.struct.spaceId
    const space = spaceId && spaceMap.get(spaceId)?.struct
    const postLink = space && data && postUrl(space, comment)

    if (!postLink) return undefined

    const preview = renderSubjectPreview(data?.content, postLink)
    const image = data?.content?.image

    return {
      preview,
      image,
      owner: data.struct.ownerId,
      links: {
        href: '/[spaceId]/[slug]',
        as: postLink
      }
    }

  }
  return undefined
}

const getAtivityPreview = (activity: Activity, store: ActivityStore, type: NotifActivitiesType) => {
  const { event, space_id, post_id, comment_id, following_id } = activity
  const { spaceById, postById, ownerById } = store
  const eventName = event as EventsName

  const getCommentPreviewWithMaps = (comment_id: string) =>
    getCommentPreview(new BN(comment_id), spaceById, postById)

  const getPostPreviewWithMaps = (postId: string) =>
    getPostPreview({
      postId,
      spaceMap: spaceById,
      postMap: postById,
      event: eventName
    })

  const getSpacePreviewWithMaps = (spaceId: string) =>
    getSpacePreview(spaceId, spaceById)

  const isActivity = type === 'activities'

  switch (eventName) {
    case 'AccountFollowed': return getAccountPreview(following_id!, ownerById)
    case 'SpaceFollowed': return getSpacePreviewWithMaps(space_id!)
    case 'SpaceCreated': return getSpacePreviewWithMaps(space_id!)
    case 'CommentCreated': return getCommentPreviewWithMaps(comment_id!)
    case 'CommentReplyCreated': return getCommentPreviewWithMaps(comment_id!)
    case 'PostShared': return isActivity ? undefined : getPostPreviewWithMaps(post_id!)
    case 'CommentShared': return getCommentPreviewWithMaps(comment_id!)
    case 'PostReactionCreated': return getPostPreviewWithMaps(post_id!)
    case 'CommentReactionCreated': return getCommentPreviewWithMaps(comment_id!)
    case 'PostCreated': return isActivity ? getPostPreviewWithMaps(post_id!) : undefined
    default: return undefined
  }
}

const getNotificationMessage = (msg: string, aggregationCount: number, preview: JSX.Element | null, withAggregation: boolean) => {
  const aggregationMsg = withAggregation
    ? aggregationCount > 0 && <>{' and '}
      <Pluralize count={aggregationCount} singularText='other person' pluralText='other people' />
    </>
    : undefined

  return <span className="DfActivityMsg">{aggregationMsg} {msg} {preview}</span>
}

type GetNotificationProps = InnerNotificationsProps & {
  activity: Activity,
}

export const getNotification = (props: GetNotificationProps): NotificationType | undefined => {
  const { type, activityStore, activity, myAddress } = props
  const { account, block_number, event_index, event, date, agg_count } = activity
  const formatDate = dayjs(date).format('lll')
  const creator = activityStore.ownerById.get(account)
  const activityPreview = getAtivityPreview(activity, activityStore, type)

  if (!activityPreview) return undefined

  const { preview, msg, owner, ...other } = activityPreview
  const msgType: NotifActivitiesType = equalAddresses(myAddress, owner) ? type : 'activities'
  const eventMsg = messages[msgType] as EventsMsg

  const notificationMessage = getNotificationMessage(
    msg || eventMsg[event as EventsName],
    agg_count - 1,
    preview,
    type === 'notifications'
  )

  return {
    id: `${block_number}-${event_index}`,
    address: account,
    notificationMessage,
    details: formatDate,
    owner: creator,
    ...other
  }
}
