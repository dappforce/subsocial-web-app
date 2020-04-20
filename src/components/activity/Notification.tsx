import React, { useEffect, useState } from 'react';
import { DfBgImg } from '../utils/DfBgImg';
import { nonEmptyStr } from '@subsocial/utils';
import Avatar from '../profiles/address-views/Avatar'
import { ProfileData, Activity, PostData, CommentData, BlogData, AnySubsocialData, CommonStruct } from '@subsocial/types';
import Name from '../profiles/address-views/Name';
import { MutedDiv } from '../utils/MutedText';
import BN from 'bn.js'
import { hexToBn, hexToString } from '@polkadot/util';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { SocialAccount } from '@subsocial/types/substrate/interfaces';
import ViewBlogPage from '../blogs/ViewBlog';
import ViewPostPage from '../posts/ViewPost';
import moment from 'moment-timezone';
import { Loading } from '../utils/utils';

type EventsName = 'AccountFollowed' | 'PostShared' | 'BlogFollowed' | 'BlogCreated' | 'CommentCreated' | 'CommentReply' | 'PostReactionCreated' | 'PostReactionCreated' | 'CommentReactionCreated'

type EventsMsg = {
  [key in EventsName]: string;
};
const eventsMsg: EventsMsg = {
  AccountFollowed: 'followed your account',
  PostShared: 'shared your post',
  BlogFollowed: 'followed your blog',
  BlogCreated: 'created a new blog',
  CommentCreated: 'commented on your post',
  CommentReply: 'replied to your comment',
  PostReactionCreated: 'reacted to your post',
  CommentReactionCreated: 'reacted to your comment'
}

type Struct = Exclude<CommonStruct, SocialAccount>;

type LoadProps = {
  activities: Activity[]
}

type Notification = {
  address: string
  activityMsg: React.ReactNode,
  details?: string,
  owner?: ProfileData
  imagePreview?: string
}

type NotificationsProps = {
  notifications: Notification[]
}

export function withLoadNotifications<P extends LoadProps> (Component: React.ComponentType<NotificationsProps>) {
  return function (props: P) {
    const { activities } = props;
    const { subsocial } = useSubsocialApi()
    const [ loaded, setLoaded ] = useState(false)

    const ownerIds: string[] = []
    const blogIds: BN[] = []
    const postIds: BN[] = []
    const commentIds: BN[] = []

    activities.forEach(({ account, blog_id, post_id, comment_id }) => {
      nonEmptyStr(account) && ownerIds.push(account)
      nonEmptyStr(blog_id) && blogIds.push(hexToBn(blog_id))
      nonEmptyStr(post_id) && postIds.push(hexToBn(post_id))
      nonEmptyStr(comment_id) && commentIds.push(hexToBn(comment_id))
    })

    const blogByBlogIdMap = new Map<string, BlogData>()
    const postByPostIdMap = new Map<string, PostData>()
    const commentByCommentIdMap = new Map<string, CommentData>()
    const ownerDataByOwnerIdMap = new Map<string, ProfileData>()

    useEffect(() => {
      setLoaded(false);
      const loadData = async () => {
        const ownersData = await subsocial.findProfiles(ownerIds);
        const blogsData = await subsocial.findBlogs(blogIds)
        const postsData = await subsocial.findPosts(postIds)
        const commentsData = await subsocial.findComments(commentIds)

        function fillMaps<T extends AnySubsocialData> (data: T[], map: Map<string, T>, owners: boolean = false) {
          data.forEach(x => {
            const struct = owners ? (x as ProfileData).profile : x.struct;
            if (struct) {
              const id = (struct as Struct).created.account.toString()
              map.set(id.toString(), x);
            }
          })
        }
        fillMaps<ProfileData>(ownersData, ownerDataByOwnerIdMap, true)
        fillMaps<BlogData>(blogsData, blogByBlogIdMap)
        fillMaps<PostData>(postsData, postByPostIdMap)
        fillMaps<CommentData>(commentsData, commentByCommentIdMap)
        setLoaded(true);
      }

      loadData().catch(err => new Error(err))

    }, [ false ])

    function getDataById<T extends AnySubsocialData> (hexId: string, map: Map<string, T>) {
      const id = hexToString(hexId);
      return map.get(id)
    }

    const getNotification = (activity: Activity): Notification => {
      const { account, event, blog_id, post_id, comment_id, date } = activity;
      const formatDate = moment(date).format('lll');
      const owner = ownerDataByOwnerIdMap.get(account);
      let msg = eventsMsg[(event as EventsName)]
      let activityMsg!: JSX.Element
      let imagePreview: string | undefined;
      switch (event) {
        case 'AccountFollowed': {
          activityMsg = <>{msg}</>
          break;
        }
        // eslint-disable-next-line no-fallthrough
        case 'BlogFollowed': {
          const data = getDataById<BlogData>(blog_id, blogByBlogIdMap)
          activityMsg = <>{msg}<ViewBlogPage blogData={data} nameOnly withLink /></>
          break;
        }
        case 'BlogCreated': {
          const data = getDataById<BlogData>(blog_id, blogByBlogIdMap)
          activityMsg = <>{msg}<ViewBlogPage blogData={data} nameOnly withLink /></>
          break;
        }
        case 'CommentCreated': {
          const commentData = getDataById<CommentData>(comment_id, commentByCommentIdMap)
          const commentStruct = commentData?.struct;
          if (commentStruct) {
            if (commentStruct.parent_id.isSome) {
              msg = eventsMsg.CommentReactionCreated;
            }
            const postId = commentStruct.post_id;
            const data = postByPostIdMap.get(postId.toString());
            activityMsg = <>{msg}<ViewPostPage postData={data as PostData} withCreatedBy={false} variant='name only' /></>
            imagePreview = data?.content?.image;
          }
          break;
        }
        case 'PostShared': {
          const data = getDataById<PostData>(post_id, postByPostIdMap)
          activityMsg = <>{msg}<ViewPostPage postData={data as PostData} withCreatedBy={false} variant='name only' /></>
          imagePreview = data?.content?.image;
          break;
        }
        case 'PostReactionCreated': {
          const data = getDataById<PostData>(post_id, postByPostIdMap)
          activityMsg = <>{msg}<ViewPostPage postData={data as PostData} withCreatedBy={false} variant='name only' /></>
          imagePreview = data?.content?.image;
          break;
        }
        case 'CommentReactionCreated': {
          const commentData = getDataById<CommentData>(comment_id, commentByCommentIdMap)
          const commentStruct = commentData?.struct;
          if (commentStruct) {
            const postId = commentStruct.post_id;
            const data = postByPostIdMap.get(postId.toString());
            activityMsg = <>{msg}<ViewPostPage postData={data as PostData} withCreatedBy={false} variant='name only' /></>
            imagePreview = data?.content?.image;
          }
          break;
        }
      }
      return { address: account, activityMsg, details: formatDate, imagePreview, owner }
    }

    if (loaded) {
      const notifications = activities.map(x => getNotification(x))
      return <Component notifications={notifications} />
    } else {
      return <Loading />
    }
  }
}

export const NotificationsView: React.FunctionComponent<NotificationsProps> = ({ notifications }) =>
  <>{notifications.map(x => <Notification {...x} />)}</>

export const Notifications = withLoadNotifications(NotificationsView);

export function Notification (props: Notification) {
  const { address, activityMsg, details, imagePreview = '', owner } = props;
  const avatar = owner?.content?.avatar;
  return <div className='DfNotificationItem'>
    <Avatar address={address} avatar={avatar} size={30}/>
    <div className="DfNotificationContent">
      <div className="DfTextActivity">
        <Name owner={owner} address={address}/>
        {activityMsg}
      </div>
      <MutedDiv className='DfDate'>{details}</MutedDiv>
    </div>
    {nonEmptyStr(imagePreview) && <DfBgImg width={80} height={60} src={imagePreview}/>}
  </div>;
}

export default Notification
