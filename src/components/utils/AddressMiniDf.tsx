
import { BareProps } from '@polkadot/ui-app/types';

import BN from 'bn.js';
import React, { useState } from 'react';
import { AccountId, AccountIndex, Address, Balance, Option } from '@polkadot/types';
import { withCall, withMulti, withCalls } from '@polkadot/ui-api';

import classes from '@polkadot/ui-app/util/classes';
import toShortAddress from '@polkadot/ui-app/util/toShortAddress';
import BalanceDisplay from '@polkadot/ui-app/Balance';
import IdentityIcon from '@polkadot/ui-app/IdentityIcon';
import { findNameByAddress, nonEmptyStr, queryBlogsToProp } from './index';
import { FollowAccountButton } from './FollowButton';
import { MyAccountProps, withMyAccount } from './MyAccount';
import { withSocialAccount } from './utils';
import { SocialAccount, Profile, ProfileData } from '../types';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { AccountFollowersModal, AccountFollowingModal } from '../profiles/AccountsListModal';
import Router from 'next/router';
import { MutedDiv } from './MutedText';
import { Pluralize } from './Plularize';
import { DfBgImg } from './DfBgImg';
import { Popover } from 'antd';

const LIMIT_SUMMARY = 40;

export type Props = MyAccountProps & BareProps & {
  socialAccountOpt?: Option<SocialAccount>,
  profile?: Profile,
  profileData?: ProfileData,
  socialAccount?: SocialAccount,
  balance?: Balance | Array<Balance> | BN,
  children?: React.ReactNode,
  isPadded?: boolean,
  extraDetails?: React.ReactNode,
  isShort?: boolean,
  session_validators?: Array<AccountId>,
  value?: AccountId | AccountIndex | Address | string,
  name?: string,
  size?: number,
  withAddress?: boolean,
  withBalance?: boolean,
  withName?: boolean,
  withProfilePreview?: boolean,
  miniPreview?: boolean,
  withFollowButton?: boolean,
  onlyUserName?: boolean,
  optionalProfile: boolean,
  date: string,
  event?: string,
  count?: number,
  subject?: React.ReactNode,
  asActivity?: boolean
};

function AddressMini (props: Props) {

  const { children,
    myAddress,
    className,
    isPadded = true,
    extraDetails,
    session_validators,
    style,
    size,
    value,
    socialAccount,
    profile = {} as Profile,
    profileData = {} as ProfileData,
    withFollowButton,
    withProfilePreview,
    miniPreview,
    asActivity = false,
    onlyUserName = false,
    date,
    event,
    count,
    subject } = props;
  if (!value) {
    return null;
  }

  const address = value.toString();
  const isValidator = (session_validators || []).find((validator) =>
    validator.toString() === address
  );

  const followers = socialAccount !== undefined ? socialAccount.followers_count.toNumber() : 0;
  const following = socialAccount !== undefined ? socialAccount.following_accounts_count.toNumber() : 0;

  const {
    username
  } = profile;

  const {
    fullname,
    avatar,
    about
  } = profileData;

  const summary = about !== undefined && about.length > LIMIT_SUMMARY ? about.substr(0,LIMIT_SUMMARY) + '...' : about;

  const [ followersOpen, setFollowersOpen ] = useState(false);
  const [ followingOpen, setFollowingOpen ] = useState(false);

  const openFollowersModal = () => {
    if (!followers) return;

    setFollowersOpen(true);
  };

  const openFollowingModal = () => {
    if (!following) return;

    setFollowingOpen(true);
  };

  const hasAvatar = avatar && nonEmptyStr(avatar);
  const isMyProfile: boolean = address === myAddress;
  const renderCount = () => count && count > 0 && <>{' and'} <Pluralize count={count} singularText='other person' pluralText='other people' /></>;

  const renderFollowButton = (!isMyProfile)
    ? <div className = 'AddressMini follow'><FollowAccountButton address={address}/></div>
    : null;

  const renderAutorPreview = () => (
    <div
      className={classes('ui--AddressMini', isPadded ? 'padded' : '', className)}
      style={style}
    >
      <div className='ui--AddressMini-info'>
        {hasAvatar
          ? <DfBgImg size={size || 36} src={avatar} className='DfAvatar' rounded/>
          : <IdentityIcon
            isHighlight={!!isValidator}
            size={size || 36}
            value={address}
          />
        }
        <div className='DfAddressMini-popup'>
          <Popover
            placement='topLeft'
            content={renderProfilePreview()}
          >
          {renderAddress(address)}
          </Popover>
          {followersOpen && <AccountFollowersModal id={address} followersCount={followers} open={followersOpen} close={() => setFollowersOpen(false)} title={<Pluralize count={followers} singularText='Follower'/>}/>}
          {followingOpen && <AccountFollowingModal id={address} followingCount={following} open={followingOpen} close={() => setFollowingOpen(false)} title={'Following'}/>}
          {renderName(address)}
          {asActivity
            ? renderPreviewForActivity()
            : renderPreviewForAddress()
          }
        </div>
        {withFollowButton && renderFollowButton}
        {children}
      </div>
    </div>
  );
  if (onlyUserName) {
    return renderAddress(address);
  } else if (withProfilePreview) {
    return renderProfilePreview();
  } else {
    return renderAutorPreview();
  }

  function renderPreviewForAddress () {
    return <div className='ui--AddressMini-details'>
      {extraDetails}
      {renderBalance()}
    </div>;
  }

  function renderPreviewForActivity () {
    return <>
      <span className='DfActivityStreamItem content'>
        <span className='DfActivity--count'>{renderCount()}</span>
        <span className='DfActivity--event'>{' ' + event + ' '}</span>
        <span className='handle DfActivity--subject'>{subject}</span>
      </span>
      <MutedDiv className='DfDate'>{date}</MutedDiv>
    </>;
  }

  function renderProfilePreview () {
    return <div>
      <div className={`item ProfileDetails MyProfile`}>
        {hasAvatar
          ? <DfBgImg size={size || 40} src={avatar} className='DfAvatar' rounded />
          : <IdentityIcon className='image' value={address} size={size || 40} />
        }
        <div className='content' style={{ paddingLeft: '0' }}>
          <div className='header DfAccountTitle'>
            {renderAddressForProfile(address)}
          </div>
          {!miniPreview && <>
          <div className='DfPopup-about'>
            <ReactMarkdown source={summary} linkTarget='_blank' />
          </div>
          <div className='DfPopup-links'>
            <div onClick={openFollowersModal} className={`DfPopup-link ${followers ? '' : 'disable'}`}>
              <Pluralize count={followers} singularText='Follower'/></div>
            <div onClick={openFollowingModal} className={`DfPopup-link ${following ? '' : 'disable'}`}><Pluralize count={following} singularText='Following'/></div>
          </div>
        </>}
        </div>
        {renderFollowButton}
      </div>
    </div>;
  }

  function renderAddressForProfile (address: string) {
    const { withAddress = true } = props;
    if (!withAddress) {
      return null;
    }

    return (
      <Link href={`/profile?address=${address}`}>
        <a className='ui--AddressMini-address'>
          <b>{fullname || toShortAddress(address)}</b>
          <div className='DfPopup-username'>{username}</div>
        </a>
      </Link>
    );
  }

  function renderAddress (address: string) {
    const { isShort = true, withAddress = true } = props;
    if (!withAddress) {
      return null;
    }

    return (
        <div
          className={`ui--AddressMini-address asLink ${className} ${asActivity && 'activity'}`}
          onClick={() => Router.push(`/profile?address=${address}`)}
        >
          {fullname || username || (isShort ? toShortAddress(address) : address)}
        </div>
    );
  }

  function renderName (address: string) {
    let { name, withName = false } = props;
    if (!withName) {
      return null;
    }

    name = name ? name : findNameByAddress(address);
    return (nonEmptyStr(name) ?
      <div className={'ui--AddressSummary-name'} >
        Name: <b style={{ textTransform: 'uppercase' }}>{name}</b>
      </div> : null
    );
  }

  function renderBalance () {
    const { balance, value, withBalance = false } = props;
    if (!withBalance || !value) {
      return null;
    }

    return (
      <BalanceDisplay
        label='Balance: '
        balance={balance}
        className='ui--AddressSummary-balance'
        params={value}
      />
    );
  }
}

export default withMulti(
  AddressMini,
  withMyAccount,
  withCall('query.session.validators'),
  withCalls<Props>(
    queryBlogsToProp('socialAccountById',
      { paramName: 'value', propName: 'socialAccountOpt' })
  ),
  withSocialAccount
);
