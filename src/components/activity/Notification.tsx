import React, { useState } from 'react';
import { DfBgImg } from '../utils/DfBgImg';
import { nonEmptyStr } from '@subsocial/utils';
import Avatar from '../profiles/address-views/Avatar'
import { ProfileData, PostData, SpaceData, AnySubsocialData, CommonStruct, Activity } from '@subsocial/types';
import Name from '../profiles/address-views/Name';
import { MutedDiv } from '../utils/MutedText';
import BN from 'bn.js'
import { hexToBn } from '@polkadot/util';
import useSubsocialEffect from '../api/useSubsocialEffect';
import { Loading } from '../utils';
import { SocialAccount, Post } from '@subsocial/types/substrate/interfaces';
import { NotificationType, getNotification, ActivityStore } from './NotificationUtils';

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
    const [ loaded, setLoaded ] = useState(false)
    const [ spaceById, setSpaceByIdMap ] = useState(new Map<string, SpaceData>())
    const [ postById, setPostByIdMap ] = useState(new Map<string, PostData>())
    const [ ownerById, setOwnerByIdMap ] = useState(new Map<string, ProfileData>())

    useSubsocialEffect(({ subsocial }) => {
      let isSubscribe = true
      setLoaded(false);

      const ownerIds: string[] = []
      const spaceIds: BN[] = []
      const postIds: BN[] = []

      activities.forEach(({ account, space_id, post_id, comment_id }) => {
        nonEmptyStr(account) && ownerIds.push(account)
        nonEmptyStr(space_id) && spaceIds.push(hexToBn(space_id))
        nonEmptyStr(post_id) && postIds.push(hexToBn(post_id))
        nonEmptyStr(comment_id) && postIds.push(hexToBn(comment_id))
      })

      const loadData = async () => {
        const ownersData = await subsocial.findProfiles(ownerIds);
        const postsData = await subsocial.findVisiblePosts(postIds)

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
                const spaceId = struct.space_id.unwrapOr(undefined);
                spaceId && spaceIds.push(spaceId)
                break;
              }
              default: {
                id = (x.struct as Struct).id
              }
            }

            if (id) {
              dataByIdMap.set(id.toString(), x);
            }
          })
          return dataByIdMap;
        }
        isSubscribe && setPostByIdMap(createMap<PostData>(postsData, 'post'))
        isSubscribe && setOwnerByIdMap(createMap<ProfileData>(ownersData, 'profile'))

        const spacesData = await subsocial.findVisibleSpaces(spaceIds)
        isSubscribe && setSpaceByIdMap(createMap<SpaceData>(spacesData))

        setLoaded(true);
      }

      loadData().catch(err => new Error(err))

      return () => { isSubscribe = false }

    }, [ false ])

    const activityStore: ActivityStore = {
      spaceById,
      postById,
      ownerById
    }

    if (loaded) {
      const notifications = activities
        .map(x => getNotification(x, activityStore))
        .filter(x => x !== undefined) as NotificationType[]
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
