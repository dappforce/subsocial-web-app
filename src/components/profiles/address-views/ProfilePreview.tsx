import React, { useState } from 'react';
import { AddressProps } from './utils/types'
import Avatar from './Avatar';
import { nonEmptyStr } from '@subsocial/utils';
import { Pluralize } from 'src/components/utils/Plularize';
import NameDetails from './utils/NameDetails';
import { AccountFollowersModal, AccountFollowingModal } from '../AccountsListModal';
import { ProfileContent, ProfileData } from '@subsocial/types';
import { withLoadedOwner } from './utils/withLoadedOwner';
import { SummarizeMd } from 'src/components/utils/md';
import ViewProfileLink from '../ViewProfileLink';

type ProfilePreviewProps = AddressProps & {
  mini?: boolean,
  size?: number
}

export const ProfilePreview: React.FunctionComponent<ProfilePreviewProps> = ({ address, owner = {} as ProfileData, size, mini = false }) => { // TODO fix CSS style
  const [ followersOpen, setFollowersOpen ] = useState(false);
  const [ followingOpen, setFollowingOpen ] = useState(false);

  const { struct, content = {} as ProfileContent, profile } = owner;
  const { about, avatar } = content
  const { username } = profile || {}
  const accountForUrl = { address, username }

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
              <SummarizeMd md={about} more={<ViewProfileLink account={accountForUrl} title={'See More'} />} />
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
    </div>
  </div>;
};

export const ProfilePreviewWithOwner = withLoadedOwner(ProfilePreview);

export default ProfilePreviewWithOwner;
