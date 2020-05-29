import React, { useEffect, useState } from 'react';
import { DfBgImg } from '../utils/DfBgImg';
import { nonEmptyStr } from '@subsocial/utils';
import Avatar from '../profiles/address-views/Avatar'
import { ProfileData, PostData, BlogData, AnySubsocialData, CommonStruct, Activity } from '@subsocial/types';
import Name from '../profiles/address-views/Name';
import { MutedDiv } from '../utils/MutedText';
import BN from 'bn.js'
import { hexToBn } from '@polkadot/util';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { Loading } from '../utils/utils';
import { SocialAccount, Post } from '@subsocial/types/substrate/interfaces';
import { NotificationType, getNotification, ActivityStore } from './NotificationUtils';
import { DEFAULT_AVATAR_SIZE } from 'src/config/Size.config';

type Struct = Exclude<CommonStruct, SocialAccount>;

type LoadProps = {
  activities: Activity[]
}

type NotificationsProps = {
  notifications: NotificationType[]
}

export function withLoadNotifications<P extends LoadProps> (Component: React.ComponentType<NotificationsProps>) {
  return function (props: P) {
    const { activities } = props;
    const { subsocial } = useSubsocialApi()
    const [ loaded, setLoaded ] = useState(false)
    const [ blogById, setBlogByIdMap ] = useState(new Map<string, BlogData>())
    const [ postById, setPostByIdMap ] = useState(new Map<string, PostData>())
    const [ ownerById, setOwnerByIdMap ] = useState(new Map<string, ProfileData>())

    useEffect(() => {
      setLoaded(false);

      const ownerIds: string[] = []
      const blogIds: BN[] = []
      const postIds: BN[] = []

      activities.forEach(({ account, blog_id, post_id, comment_id }) => {
        nonEmptyStr(account) && ownerIds.push(account)
        nonEmptyStr(blog_id) && blogIds.push(hexToBn(blog_id))
        nonEmptyStr(post_id) && postIds.push(hexToBn(post_id))
        nonEmptyStr(comment_id) && postIds.push(hexToBn(comment_id))
      })

      const loadData = async () => {
        const ownersData = await subsocial.findProfiles(ownerIds);
        const postsData = await subsocial.findPosts(postIds)

        function createMap<T extends AnySubsocialData> (data: T[], structName?: 'profile' | 'post') {
          const dataByIdMap = new Map<string, T>()
          data.forEach(x => {
            let id;

            switch (structName) {
              case 'profile': {
                id = (x as ProfileData).profile?.created.account;
                break;
              }
              case 'post': {
                const struct = (x.struct as Post)
                id = struct.id;
                const blogId = struct.blog_id.unwrapOr(undefined);
                blogId && blogIds.push(blogId)
                break;
              }
              default : {
                id = (x.struct as Struct).id
              }
            }

            if (id) {
              dataByIdMap.set(id.toString(), x);
            }
          })
          return dataByIdMap;
        }
        setPostByIdMap(createMap<PostData>(postsData, 'post'))
        setOwnerByIdMap(createMap<ProfileData>(ownersData, 'profile'))

        const blogsData = await subsocial.findBlogs(blogIds)
        setBlogByIdMap(createMap<BlogData>(blogsData))

        setLoaded(true);
      }

      loadData().catch(err => new Error(err))

    }, [ false ])

    const activityStore: ActivityStore = {
      blogById,
      postById,
      ownerById
    }

    if (loaded) {
      const notifications = activities.map(x => getNotification(x, activityStore)).filter(x => x !== undefined) as NotificationType[]
      return <Component notifications={notifications} />
    } else {
      return <Loading />
    }
  }
}

export const NotificationsView: React.FunctionComponent<NotificationsProps> = ({ notifications }) =>
  <>{notifications.map((x, i) => <Notification key={i} {...x} />)}</>

export const Notifications = withLoadNotifications(NotificationsView);

export function Notification (props: NotificationType) {
  const { address, notificationMessage, details, image = '', owner } = props;
  const avatar = owner?.content?.avatar;
  return <div className='DfNotificationItem'>
    <Avatar address={address} avatar={avatar} />
    <div className="DfNotificationContent">
      <div className="DfTextActivity">
        <Name owner={owner} address={address}/>
        {notificationMessage}
      </div>
      <MutedDiv className='DfDate'>{details}</MutedDiv>
    </div>
    {nonEmptyStr(image) && <DfBgImg width={80} height={60} src={image}/>}
  </div>;
}

export default Notification
