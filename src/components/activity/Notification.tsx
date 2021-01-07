import React from 'react'
import { DfBgImageLink } from '../utils/DfBgImg'
import { nonEmptyStr } from '@subsocial/utils'
import Avatar from '../profiles/address-views/Avatar'
import Name from '../profiles/address-views/Name'
import { MutedDiv } from '../utils/MutedText'
import Link from 'next/link'
import { Pluralize } from '../utils/Plularize'
import { asCommentData } from 'src/types'
import { Activity, EventsName } from '@subsocial/types'
import { useAppSelector } from 'src/rtk/app/store'
import { selectSpace } from 'src/rtk/features/spaces/spacesSlice'
import { selectProfile } from 'src/rtk/features/profiles/profilesSlice'
import { NotifActivitiesType } from './Notifications'
import { useMyAddress } from '../auth/MyAccountContext'
import { equalAddresses } from '../substrate'
import messages from 'src/messages'
import { accountUrl, postUrl, spaceUrl } from '../urls'
import { selectPost } from 'src/rtk/features/posts/postsSlice'
import ViewPostLink from '../posts/ViewPostLink'
import { PathLinks, EventsMsg } from './types'
import { ViewSpace } from '../spaces/ViewSpace'
import { formatDate } from '../utils'

type NotificationMessageProps = {
  msg: string,
  aggregationCount: number,
  withAggregation?: boolean
}

const NotificationMessage = ({ msg, aggregationCount, withAggregation = true }: NotificationMessageProps) => {
  const aggregationMsg = withAggregation
    ? aggregationCount > 0 && <>{' and '}
      <Pluralize count={aggregationCount} singularText='other person' pluralText='other people' />
    </>
    : undefined

  return <>{aggregationMsg} {msg}&nbsp;</>
}

type NotificationProps = {
  activity: Activity,
  type: NotifActivitiesType,
}

type InnerNotificationProps = NotificationProps & PathLinks & {
  preview: React.ReactNode,
  msg?: string,
  image?: string,
}

export function InnerNotification (props: InnerNotificationProps) {
  const myAddress = useMyAddress()
  const { preview, type, image = '', links, msg: customMsg, activity: { agg_count, event, account, date } } = props
  const owner = useAppSelector(state => selectProfile(state, account.toString()))

  if (!owner || !myAddress) return null

  const avatar = owner.content?.avatar

  const msgType: NotifActivitiesType = equalAddresses(myAddress, account) ? type : 'activities'
  const eventMsg = messages[msgType] as EventsMsg

  return <Link {...links}>
    <div className='DfNotificationItem'>
      <Avatar address={account} avatar={avatar} />
      <div className="DfNotificationContent">
        <div className="DfTextActivity">
          <Name owner={owner} address={account}/>
          <span className="DfActivityMsg">
            <NotificationMessage msg={customMsg || eventMsg[event]} aggregationCount={agg_count} withAggregation={msgType === 'notifications'} />
            {preview}
          </span>
        </div>
        <MutedDiv className='DfDate'>{formatDate(date)}</MutedDiv>
      </div>
      {nonEmptyStr(image) && <DfBgImageLink {...links} src={image} size={80} className='mb-2' />}
    </div>
  </Link>
}


const SpaceNotification = (props: NotificationProps) => {
  const { activity: { space_id } } = props
  const space = useAppSelector(state => space_id ? selectSpace(state, { id: space_id }): undefined)

  if (!space) return null

  return <InnerNotification
    preview={<ViewSpace spaceData={space} nameOnly withLink />}
    image={space.content?.image}
    links={{
      href: '/[spaceId]',
      as: spaceUrl(space.struct)
    }}
    {...props}
  />
}

const AccountNotification = (props: NotificationProps) => {
  const { activity: { following_id } } = props
  const profile = useAppSelector(state => following_id ? selectProfile(state, following_id): undefined)

  if (!profile) return null

  const address = profile.id
  return <InnerNotification
    preview={<Name owner={profile} address={address}/>}
    image={profile.content?.avatar}
    links={{
      href: '/[spaceId]',
      as: accountUrl({ address })
    }}
    {...props}
  />
}

const PostNotification = (props: NotificationProps) => {
  const { activity: { post_id, event } } = props
  const postDetails = useAppSelector(state => post_id ? selectPost(state, { id: post_id }): undefined)

  if (!postDetails) return null

  const { post, ext } = postDetails

  let space = postDetails.space!
  let msg: string | undefined = undefined
  let content = post.content

  const links = {
    href: '/[spaceId]/[slug]',
    as: postUrl(space!, post)
  }

  const { isSharedPost } = post.struct

  if (isSharedPost && event === 'PostCreated') {
    msg = messages['activities'].PostSharing
    const post = ext!.post
    space = ext!.space!
    content = post.content
    links.as = postUrl(space, post)
  }

  return <InnerNotification
    preview={<ViewPostLink post={post} space={space.struct} title={post.content?.title} />}
    image={content?.image}
    msg={msg}
    links={links}
    {...props}
  />
}

const CommentNotification = (props: NotificationProps) => {
  const { activity: { comment_id } } = props
  const state = useAppSelector(state => state)
  const commentDetails = comment_id ? selectPost(state, { id: comment_id }): undefined

  const rootPostId = commentDetails ? asCommentData(commentDetails.post).struct.rootPostId : undefined
  const postDetails = rootPostId ? selectPost(state, { id: rootPostId }): undefined

  if (!postDetails) return null

  const { post, space } = postDetails

  const links = {
    href: '/[spaceId]/[slug]',
    as: postUrl(space!, post)
  }

  const { title, summary, image } = post.content!

  const name = title || summary || 'link'

  return <InnerNotification
    preview={<ViewPostLink post={post} space={space!.struct} title={name} />}
    image={image}
    links={links}
    {...props}
  />
}

export const Notification = (props: NotificationProps) => {
  const { activity, type } = props
  const isActivity = type === 'activities'
  const eventName = activity.event as EventsName

  switch (eventName) {
    case 'AccountFollowed': return <AccountNotification {...props}/>
    case 'SpaceFollowed': return <SpaceNotification {...props}/>
    case 'SpaceCreated': return <SpaceNotification {...props}/>
    case 'CommentCreated': return <CommentNotification {...props}/>
    case 'CommentReplyCreated': return <CommentNotification {...props}/>
    case 'PostShared': return isActivity ? null : <PostNotification {...props}/>
    case 'CommentShared': return <CommentNotification {...props}/>
    case 'PostReactionCreated': return <PostNotification {...props}/>
    case 'CommentReactionCreated': return <CommentNotification {...props}/>
    case 'PostCreated': return isActivity ? <PostNotification {...props}/> : null
    default: return null
  }
}

export default Notification
