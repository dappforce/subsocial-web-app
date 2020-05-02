import React, { useState } from 'react';
import { AddressProps } from './utils/types'
import Avatar from './Avatar';
import { summarize, nonEmptyStr } from '@subsocial/utils';
import { Pluralize } from 'src/components/utils/Plularize';
import dynamic from 'next/dynamic';
import NameDetails from './utils/NameDetails';
import { AccountFollowersModal, AccountFollowingModal } from '../AccountsListModal';
import { ProfileContent, ProfileData } from '@subsocial/types';
import { withLoadedOwner } from './utils/withLoadedOwner';
const FollowAccountButton = dynamic(() => import('../../utils/FollowAccountButton'), { ssr: false });

type ProfilePreviewProps = AddressProps & {
  mini?: boolean,
  size?: number
}

export const ProfilePreview: React.FunctionComponent<ProfilePreviewProps> = ({ address, owner = {} as ProfileData, size, mini = false }) => { // TODO fix CSS style
  const [ followersOpen, setFollowersOpen ] = useState(false);
  const [ followingOpen, setFollowingOpen ] = useState(false);
  const { content = {} as ProfileContent, struct } = owner;
  const {
    about,
    avatar
  } = content

  const followers = struct ? struct.followers_count.toString() : '0';
  const following = struct ? struct.following_accounts_count.toString() : '0';

  const openFollowersModal = () => {
    if (!followers) return;

    setFollowersOpen(true);
  };

  const openFollowingModal = () => {
    if (!following) return;

    setFollowingOpen(true);
  };

  return <div>
    <div className={`ProfileDetails`}>
      <Avatar size={size || 44} address={address} avatar={avatar} style={{ marginTop: '.5rem' }}/>
      <div className='content'>
        <NameDetails owner={owner} address={address} />
        {!mini && <>
          {nonEmptyStr(about) &&
            <div className='DfPopup-about'>
              {summarize(about)}
            </div>
          }
          <div className='DfPopup-links'>
            <div onClick={openFollowersModal} className={`DfPopup-link ${followers ? '' : 'disable'}`}>
              <Pluralize count={followers} singularText='Follower'/>
            </div>
            <div onClick={openFollowingModal} className={`DfPopup-link ${following ? '' : 'disable'}`}>
              <Pluralize count={following} singularText='Following'/>
            </div>
          </div>
          {followersOpen && <AccountFollowersModal id={address} followersCount={followers} open={followersOpen} close={() => setFollowersOpen(false)} title={<Pluralize count={followers} singularText='Follower' />} />}
          {followingOpen && <AccountFollowingModal id={address} followingCount={following} open={followingOpen} close={() => setFollowingOpen(false)} title={<Pluralize count={following} singularText='Following' />} />}
        </>}
      </div>
      <FollowAccountButton address={address} />
    </div>
  </div>;
};

export const ProfilePreviewWithOwner = withLoadedOwner(ProfilePreview);

export default ProfilePreviewWithOwner;
