/* eslint-disable react/jsx-no-target-blank */
import React, { useState } from 'react';
import { DfMd } from '../utils/DfMd';
import Link from 'next/link';

import { withCalls, withMulti, registry } from '@polkadot/react-api';
import { GenericAccountId as AccountId, Option } from '@polkadot/types';
import IdentityIcon from '@polkadot/react-components/IdentityIcon';
import { queryBlogsToProp, ZERO } from '../utils/index';
import { HeadMeta } from '../utils/HeadMeta';
import { nonEmptyStr, isEmptyStr, summarize, getFirstOrUndefinded } from '@subsocial/utils'
import { withSocialAccount } from '../utils/utils';
import { AccountFollowersModal, AccountFollowingModal } from './AccountsListModal';
// import { ProfileHistoryModal } from '../utils/ListsEditHistory';
import dynamic from 'next/dynamic';
import { MutedDiv } from '../utils/MutedText';
import { useMyAccount } from '../utils/MyAccountContext';
import Section from '../utils/Section';
import { DfBgImg } from '../utils/DfBgImg';
import { Pluralize } from '../utils/Plularize';

import { TX_BUTTON_SIZE } from '../../config/Size.config';
import { Menu, Dropdown, Icon } from 'antd';
import { NextPage } from 'next';
import { ipfs } from '../utils/SubsocialConnect';
import BN from 'bn.js';
import isEmpty from 'lodash.isempty';
import { Profile, SocialAccount } from '@subsocial/types/substrate/interfaces';
import { ProfileContent } from '@subsocial/types/offchain';
import { SubsocialApi } from '@subsocial/api/fullApi';
// const BalanceDisplay = dynamic(() => import('@polkadot/react-components/Balance'), { ssr: false });
const FollowAccountButton = dynamic(() => import('../utils/FollowAccountButton'), { ssr: false });

export type Props = {
  preview?: boolean,
  nameOnly?: boolean,
  withLink?: boolean,
  id: AccountId,
  profile?: Profile,
  ProfileContent?: ProfileContent,
  socialAccount?: SocialAccount,
  followers?: AccountId[],
  size?: number
};

const Component: NextPage<Props> = (props: Props) => {
  const {
    id,
    preview = false,
    nameOnly = false,
    withLink = false,
    size = 48,
    socialAccount,
    profile = {} as Profile,
    ProfileContent = {} as ProfileContent
  } = props;

  const [ followersOpen, setFollowersOpen ] = useState(false);
  const [ followingOpen, setFollowingOpen ] = useState(false);

  const address = id.toString();
  const { state: { address: myAddress } } = useMyAccount();
  const isMyAccount = address === myAddress;

  const profileIsNone = !socialAccount || isEmpty(profile);
  const followers = socialAccount ? new BN(socialAccount.followers_count) : ZERO;
  const following = socialAccount ? new BN(socialAccount.following_accounts_count) : ZERO;
  const reputation = socialAccount ? new BN(socialAccount.reputation) : ZERO;

  const {
    username,
    edit_history
  } = profile;

  const {
    fullname,
    avatar,
    email,
    personal_site,
    about,
    facebook,
    twitter,
    linkedIn,
    github,
    instagram
  } = ProfileContent;

  const hasEmail = email && nonEmptyStr(email);
  const hasPersonalSite = personal_site && nonEmptyStr(personal_site);
  const hasAvatar = avatar && nonEmptyStr(avatar);
  const hasFacebookLink = facebook && nonEmptyStr(facebook);
  const hasTwitterLink = twitter && nonEmptyStr(twitter);
  const hasLinkedInLink = linkedIn && nonEmptyStr(linkedIn);
  const hasGithubLink = github && nonEmptyStr(github);
  const hasInstagramLink = instagram && nonEmptyStr(instagram);

  const renderCreateProfileButton = profileIsNone && address === myAddress &&
    <Link href={`/profile/new`}>
      <a style={{ marginTop: '.5rem', textAlign: 'initial' }} className={'ui button primary ' + TX_BUTTON_SIZE}>
        <i className='plus icon' />
        Create profile
      </a>
    </Link>;

  const renderDropDownMenu = () => {
    if (profileIsNone) return null;

    const showDropdown = isMyAccount || edit_history.length > 0;

    const menu = (
      <Menu>
        {isMyAccount && <Menu.Item key='0'>
          <Link href={`/profile/edit`} ><a className='item'>Edit</a></Link>
        </Menu.Item>}
        {/* {edit_history.length > 0 && <Menu.Item key='1'>
          <div onClick={() => setOpen(true)} >View edit history</div>
        </Menu.Item>} */}
      </Menu>
    );

    return (showDropdown && <>
      <Dropdown overlay={menu} placement='bottomRight'>
        <Icon type='ellipsis' />
      </Dropdown>
      {/* open && <ProfileHistoryModal id={id} open={open} close={close} /> */}
    </>);
  };

  const isOnlyAddress = isEmptyStr(fullname) || isEmptyStr(username);

  const getName = () => {
    if (isOnlyAddress) {
      return address;
    } else {
      return fullname;
    }
  };

  const renderDescription = () => preview
    ? summarize(about)
    : <DfMd source={about} />;

  const NameAsLink = () => (
    <Link href='/profile/[address]' as={`/profile/${address}`}>
      <a className='handle'>{getName()}</a>
    </Link>
  );

  const renderNameOnly = () => {
    return withLink
      ? <NameAsLink />
      : <>{getName()}</>;
  };

  const renderPreview = () => {
    return <div>
      <div className={`item ProfileDetails MyBlog`}>
        {hasAvatar
          ? <DfBgImg size={size} src={avatar} className='DfAvatar' rounded/>
          : <IdentityIcon className='image' value={address} size={size} />
        }
        <div className='content'>
          <div className='header DfProfileTitle'>
            <NameAsLink />
            {renderDropDownMenu()}
          </div>
          {!isOnlyAddress && <MutedDiv>Address: {address}</MutedDiv>}
          {/* <BalanceDisplay

            label='Balance: '
            className='Df--profile-balance'
            params={address}
          /> */}
          <div className='about'>
            <div>
              <MutedDiv className='DfScore'>Reputation: {reputation.toString()}</MutedDiv>
              <div className='DfSocialLinks'>
                {hasEmail &&
                  <a
                    href={`mailto:${email}`}
                    target='_blank'
                  >
                    <Icon type='mail' />
                  </a>
                }
                {hasPersonalSite &&
                  <a
                    href={personal_site}
                    target='_blank'
                  >
                    <Icon type='global' />
                  </a>
                }
                {hasFacebookLink &&
                  <a
                    href={facebook}
                    target='_blank'
                  >
                    <Icon type='facebook' />
                  </a>
                }
                {hasTwitterLink &&
                  <a
                    href={twitter}
                    target='_blank'
                  >
                    <Icon type='twitter' />
                  </a>}
                {hasLinkedInLink &&
                  <a
                    href={linkedIn}
                    target='_blank'
                  >
                    <Icon type='linkedin' />
                  </a>
                }
                {hasGithubLink &&
                  <a
                    href={github}
                    target='_blank'
                  >
                    <Icon type='github' />
                  </a>
                }
                {hasInstagramLink &&
                  <a
                    href={instagram}
                    target='_blank'
                  >
                    <Icon type='instagram' />
                  </a>
                }
              </div>
            </div>
            {renderDescription()}
          </div>
        </div>
      </div>
    </div>;
  };

  if (nameOnly) {
    return renderNameOnly();
  } else if (preview) {
    return renderPreview();
  }

  const noFollowers = !followers.eq(ZERO);
  const noFollowing = !following.eq(ZERO);

  return <>
    <HeadMeta title={getName()} desc={about} image={avatar} />
    <Section>
      <div className='FullProfile'>
        {renderPreview()}
        <div className='Profile--actions'>
          <FollowAccountButton address={address} size={TX_BUTTON_SIZE}/>
          <span onClick={() => noFollowers && setFollowersOpen(true)} className={`DfGreyLink ${noFollowers && 'disable'}`}><Pluralize count={followers.toString()} singularText='Follower'/></span>
          <span onClick={() => noFollowing && setFollowingOpen(true)} className={`DfGreyLink ${noFollowing && 'disable'}`}>{following.toString()} Following </span>
        </div>
      </div>
      {followersOpen && <AccountFollowersModal id={id} accountsCount={followers.toString()} open={followersOpen} close={() => setFollowersOpen(false)} title={<Pluralize count={followers.toString()} singularText='Follower'/>} />}
      {followingOpen && <AccountFollowingModal id={id} accountsCount={following.toString()} open={followingOpen} close={() => setFollowingOpen(false)} title={'Following'} />}
      {renderCreateProfileButton}
    </Section>
  </>;
};

Component.getInitialProps = async (props): Promise<Props> => {
  const { query: { address } } = props;
  const { substrate } = (props as any).subsocial as SubsocialApi
  const socialAccountOpt = await substrate.socialQuery().socialAccountById(address) as Option<SocialAccount>;
  const socialAccount = socialAccountOpt.isSome ? socialAccountOpt.unwrap() : undefined;
  const profileOpt = socialAccount ? socialAccount.profile : undefined;
  const profile = profileOpt !== undefined && profileOpt.isSome ? profileOpt.unwrap() as Profile : undefined;
  const content = profile && getFirstOrUndefinded(await ipfs.getContentArray<ProfileContent>([ profile.ipfs_hash ]));
  return {
    id: new AccountId(registry, address as string),
    socialAccount: socialAccount,
    profile: profile,
    ProfileContent: content
  };
};

export default Component;

export const ViewProfile = withMulti(
  Component,
  withCalls<Props>(
    queryBlogsToProp('socialAccountById',
      { paramName: 'id', propName: 'socialAccountOpt' })
  ),
  withSocialAccount
);
