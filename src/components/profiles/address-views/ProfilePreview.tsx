
import React, { useState } from 'react';
import { CommonAddressProps } from './utils/types'
import Avatar from './utils/Avatar';
import { summarize } from '@subsocial/utils';
import { Pluralize } from 'src/components/utils/Plularize';
import dynamic from 'next/dynamic';
import NameDetails from './utils/NameDetails';
import { AccountFollowersModal, AccountFollowingModal } from '../AccountsListModal';
import { ProfileContent } from '@subsocial/types';
const FollowAccountButton = dynamic(() => import('../../utils/FollowAccountButton'), { ssr: false });

type ProfilePreviewProps = CommonAddressProps & {
  mini?: boolean
}

export const ProfilePreview: React.FunctionComponent<ProfilePreviewProps> = ({ address, socialAccount, username, content = {} as ProfileContent, mini = false }) => { // TODO fix CSS style
  const [ followersOpen, setFollowersOpen ] = useState(false);
  const [ followingOpen, setFollowingOpen ] = useState(false);

  const {
    fullname,
    about,
    avatar
  } = content

  const followers = socialAccount ? socialAccount.followers_count.toString() : '0';
  const following = socialAccount ? socialAccount.following_accounts_count.toString() : '0';

  const openFollowersModal = () => {
    if (!followers) return;

    setFollowersOpen(true);
  };

  const openFollowingModal = () => {
    if (!following) return;

    setFollowingOpen(true);
  };

  return <div>
    <div className={`item ProfileDetails MyProfile`}>
      <Avatar size={40} address={address} avatar={avatar} style={{ marginTop: '.5rem' }}/>
      <div className='content' style={{ paddingLeft: '1rem' }}>
        <div className='header DfAccountTitle'>
          <NameDetails fullname={fullname} username={username} address={address} />
        </div>
        {!mini && <>
          <div className='DfPopup-about'>
            {about && summarize(about)}
          </div>
          <div className='DfPopup-links'>
            <div onClick={openFollowersModal} className={`DfPopup-link ${followers ? '' : 'disable'}`}>
              <Pluralize count={followers} singularText='Follower'/>
            </div>
            <div onClick={openFollowingModal} className={`DfPopup-link ${following ? '' : 'disable'}`}>
              <Pluralize count={following} singularText='Following'/>
            </div>
          </div>
        </>}
      </div>
      <FollowAccountButton address={address} />
    </div>
    {followersOpen && <AccountFollowersModal id={address} followersCount={followers} open={followersOpen} close={() => setFollowersOpen(false)} title={<Pluralize count={followers} singularText='Follower' />} />}
    {followingOpen && <AccountFollowingModal id={address} followingCount={following} open={followingOpen} close={() => setFollowingOpen(false)} title={<Pluralize count={following} singularText='Following' />} />}
  </div>;
};

export default ProfilePreview;
