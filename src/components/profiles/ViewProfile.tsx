import React, { useState, useCallback } from 'react';
import { DfMd } from '../utils/DfMd';
import Link from 'next/link';

import { AccountId } from '@polkadot/types/interfaces';
import { ZERO } from '../utils/index';
import { HeadMeta } from '../utils/HeadMeta';
import { isEmptyStr } from '@subsocial/utils'
import { AccountFollowersModal, AccountFollowingModal } from './AccountsListModal';
// import { ProfileHistoryModal } from '../utils/ListsEditHistory';
import dynamic from 'next/dynamic';
import { isMyAddress } from '../auth/MyAccountContext';
import Section from '../utils/Section';
import { Pluralize } from '../utils/Plularize';

import {
  EllipsisOutlined,
  PlusOutlined
} from '@ant-design/icons';

import { Menu, Dropdown, Button } from 'antd';
import { NextPage } from 'next';
import BN from 'bn.js';
import isEmpty from 'lodash.isempty';
import { ProfileContent } from '@subsocial/types/offchain';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import { ProfileData, SpaceData } from '@subsocial/types';
import { withLoadedOwner, withMyProfile } from './address-views/utils/withLoadedOwner';
import { getAccountId } from '../substrate';
import { LARGE_AVATAR_SIZE } from 'src/config/Size.config';
import Avatar from './address-views/Avatar';
import Name from './address-views/Name';
import MyEntityLabel from '../utils/MyEntityLabel';
import { Balance } from './address-views/utils/Balance';
import { CopyAddress, EditProfileLink, AccountSpacesLink } from './address-views/utils';
import { mdToText } from 'src/utils';
import { SpaceId } from '@subsocial/types/substrate/interfaces';
import { InfoSection } from './address-views/InfoSection';
import { AccountActivity } from '../activity/AccountActivity';
import { PageContent } from '../main/PageWrapper';
import { KusamaRolesTags } from '../kusama/KusamaRoles';
import { KusamaIdentity } from '../kusama/KusamaIdentity';

const FollowAccountButton = dynamic(() => import('../utils/FollowAccountButton'), { ssr: false });

export type Props = {
  address: AccountId,
  owner?: ProfileData,
  followers?: AccountId[],
  mySpaceIds?: SpaceId[],
  spacesData?: SpaceData[],
  size?: number
};

const Component = (props: Props) => {
  const {
    address,
    size = LARGE_AVATAR_SIZE,
    owner,
    spacesData,
    mySpaceIds
  } = props;

  const [ followersOpen, setFollowersOpen ] = useState(false);
  const [ followingOpen, setFollowingOpen ] = useState(false);

  const isMyAccount = isMyAddress(address);

  const noProfile = isEmpty(owner?.profile);
  const followers = owner ? new BN(owner.struct.followers_count) : ZERO;
  const following = owner ? new BN(owner.struct.following_accounts_count) : ZERO;
  const reputation = owner ? owner.struct.reputation : ZERO;

  const {
    avatar,
    about
  } = owner?.content || {} as ProfileContent;

  const createProfileButton = noProfile && isMyAccount &&
    <Link href='/accounts/new' as='/accounts/new'>
      <Button type='primary' ghost>
        <PlusOutlined />
        Create profile
      </Button>
    </Link>;

  const DropDownMenu = useCallback(() => {

    const menu = (
      <Menu>
        {isMyAccount && <Menu.Item key='0'>
          <EditProfileLink address={address} className='item' />
        </Menu.Item>}
        {/* {edit_history.length > 0 && <Menu.Item key='1'>
          <div onClick={() => setOpen(true)} >View edit history</div>
        </Menu.Item>} */}
      </Menu>
    );

    return <>
      {isMyAccount &&
        <Dropdown overlay={menu} placement='bottomRight'>
          <EllipsisOutlined />
        </Dropdown>
      }
      {/* open && <ProfileHistoryModal id={id} open={open} close={close} /> */}
    </>
  }, [ isMyAccount ]);

  const hasFollowers = followers.gt(ZERO);
  const hasFollowing = following.gt(ZERO);

  const followersText = <Pluralize count={followers} singularText='Follower' />
  const followingText = <Pluralize count={following} singularText='Following' />

  return <PageContent>
    <Section className='mb-3'>
      <div className='d-flex'>
        <Avatar size={size || LARGE_AVATAR_SIZE} address={address} avatar={avatar} />
        <div className='ml-3 w-100'>
          <InfoSection
            level={1}
            column={1}
            title={<>
              <span className='d-flex align-items-center'>
                <Name owner={owner} address={address} className='mr-3' />
                <MyEntityLabel isMy={isMyAccount}>Me</MyEntityLabel>
                <KusamaRolesTags address={address} />
              </span>
              <DropDownMenu />
            </>}
            items={[
              {
                label: 'Address',
                value: <CopyAddress address={address}>
                  <span className='DfBlackLink'>{address}</span>
                </CopyAddress>
              },
              {
                label: 'Balance',
                value: <Balance address={address} />
              },
              {
                label: 'Reputation',
                value: reputation.toString()
              }
            ]}
          />
          <div className='about'>
            {about && <DfMd className='mt-3' source={about} />}
            <KusamaIdentity address={address} withSection />
          </div>
          <div className='mt-3'>
            <span onClick={() => hasFollowers && setFollowersOpen(true)} className={`${!hasFollowers && 'disable'} DfProfileModalLink`}>{followersText}</span>
            <span onClick={() => hasFollowing && setFollowingOpen(true)} className={`${!hasFollowing && 'disable'} DfProfileModalLink`}>{followingText}</span>
            <AccountSpacesLink address={address} className='DfProfileModalLink' />
            <div className='mt-3'>
              {createProfileButton}
              <FollowAccountButton address={address} />
            </div>
          </div>
        </div>
      </div>
      {followersOpen && <AccountFollowersModal id={address} accountsCount={followers.toString()} open={followersOpen} close={() => setFollowersOpen(false)} title={followersText} />}
      {followingOpen && <AccountFollowingModal id={address} accountsCount={following.toString()} open={followingOpen} close={() => setFollowingOpen(false)} title={followingText} />}
    </Section>
    <AccountActivity address={address.toString()} mySpaceIds={mySpaceIds} spacesData={spacesData} />
  </PageContent>;
};

const ProfilePage: NextPage<Props> = (props) => {
  const { address, owner } = props

  const {
    name,
    avatar,
    about
  } = owner?.content || {} as ProfileContent;

  const isOnlyAddress = isEmptyStr(name)

  const getName = () => {
    if (isOnlyAddress) {
      return address.toString();
    } else {
      return name;
    }
  };

  return <>
    <HeadMeta title={getName()} desc={mdToText(about)} image={avatar} />
    <Component {...props} />
  </>
}

ProfilePage.getInitialProps = async (props): Promise<any> => {
  const { query: { address }, res } = props;
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial
  const accountId = await getAccountId(address as string);

  if (!accountId && res) {
    res.statusCode = 404
    return { statusCode: 404 }
  }

  const addressStr = accountId as string

  const owner = await subsocial.findProfile(addressStr)
  const mySpaceIds = await substrate.spaceIdsByOwner(addressStr)
  const spacesData = await subsocial.findPublicSpaces(mySpaceIds)

  return {
    address: accountId,
    owner,
    spacesData,
    mySpaceIds
  };
};

export default ProfilePage;

export const ViewProfile = withLoadedOwner(Component)

export const ViewMyProfile = withMyProfile(Component)
