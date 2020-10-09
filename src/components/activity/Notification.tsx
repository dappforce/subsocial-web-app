import React from 'react';
import { DfBgImg } from '../utils/DfBgImg';
import { nonEmptyStr } from '@subsocial/utils';
import Avatar from '../profiles/address-views/Avatar'
import { ProfileData, AnySubsocialData, CommonStruct, Activity } from '@subsocial/types';
import Name from '../profiles/address-views/Name';
import { MutedDiv } from '../utils/MutedText';
import BN from 'bn.js'
import { hexToBn } from '@polkadot/util';
import { SocialAccount, Post } from '@subsocial/types/substrate/interfaces';
import { NotificationType, getNotification, ActivityStore } from './NotificationUtils';
import { SubsocialApi } from '@subsocial/api/subsocial';

type Struct = Exclude<CommonStruct, SocialAccount>;

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

export const loadNotifications = async (
    subsocial: SubsocialApi,
    activities: Activity[],
    activityStore: ActivityStore
  ) => {
    const { spaceById, postById, ownerById } = activityStore

    const ownerIds: string[] = []
    const spaceIds: BN[] = []
    const postIds: BN[] = []

    activities.forEach(({ account, space_id, post_id, comment_id }) => {
      nonEmptyStr(account) && fillArray(account, ownerIds, ownerById)
      nonEmptyStr(space_id) && fillArray(hexToBn(space_id), spaceIds, spaceById)
      nonEmptyStr(post_id) && fillArray(hexToBn(post_id), postIds, postById)
      nonEmptyStr(comment_id) && fillArray(hexToBn(comment_id), postIds, postById)
    })

    const ownersData = await subsocial.findProfiles(ownerIds);
    const postsData = await subsocial.findPublicPosts(postIds);

    function fillMap<T extends AnySubsocialData> (data: T[], structByIdMap: Map<string, AnySubsocialData>, structName?: 'profile' | 'post') {
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
          structByIdMap.set(id.toString(), x);
        }
      })
    }


    fillMap(postsData, postById, 'post'),
    fillMap(ownersData, ownerById, 'profile')

    const spacesData = await subsocial.findPublicSpaces(spaceIds);
    fillMap(spacesData, spaceById)

  return activities
    .map(x => getNotification(x, activityStore))
    .filter(x => x !== undefined) as NotificationType[]
}

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
