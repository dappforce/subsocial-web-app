import React from 'react';
import { Option } from '@polkadot/types';
import { Icon } from 'antd';
import moment from 'moment-timezone';
import BN from 'bn.js';
import { Profile, SocialAccount, Post, Space } from '@subsocial/types/substrate/interfaces';
import { ProfileContent } from '@subsocial/types/offchain';
import { Moment } from '@polkadot/types/interfaces';
import { isMyAddress } from '../auth/MyAccountContext';
import { AnyAccountId } from '@subsocial/types';
import { ZERO } from '.';

type PropsWithSocialAccount = {
  profile?: Profile;
  ProfileContent?: ProfileContent;
  socialAccount?: SocialAccount;
  requireProfile?: boolean;
};

type LoadSocialAccount = PropsWithSocialAccount & {
  socialAccountOpt?: Option<SocialAccount>;
};

export function withRequireProfile<P extends LoadSocialAccount> (Component: React.ComponentType<P>) {
  return function (props: P) {
    return <Component {...props} requireProfile />;
  };
}

export const Loading = () => <div className='d-flex justify-content-center align-items-center w-100 h-100'><Icon type='loading' /></div>;

export const formatUnixDate = (_seconds: number | BN | Moment, format: string = 'lll') => {
  const seconds = typeof _seconds === 'number' ? _seconds : _seconds.toNumber()
  return moment(new Date(seconds)).format(format);
};

export const fakeClientId = () => `fake-${new Date().getTime().toString()}`

type VisibilityProps = {
  struct: Post | Space,
  address?: AnyAccountId
}

export const isVisible = ({ struct, address }: VisibilityProps) => !struct.hidden.valueOf() || !isMyAddress(address)
export const isHidden = (props: VisibilityProps) => !isVisible(props)

export const toShortAddress = (_address: AnyAccountId) => {
  const address = (_address || '').toString();

  return address.length > 13 ? `${address.slice(0, 6)}…${address.slice(-6)}` : address;
}

type IconWithTitleProps = {
  icon: JSX.Element | string,
  count: BN,
  label?: string,
  withTitle?: boolean
}

export const IconWithLabel = ({ icon, label, count, withTitle }: IconWithTitleProps) => {
  const renderIcon = () => typeof icon === 'string' ? <Icon type={icon} /> : icon;
  const countStr = count ? count.toString() : undefined
  const renderText = () => <span className='ml-2'>
    {withTitle && label
      ? <>
        {label}
        {countStr && ` (${countStr})`}
      </>
      : countStr}
  </span>

  return <>
    {renderIcon()}
    {renderText()}
  </>
}

export const calcVotingPercentage = (upvotesCount: BN, downvotesCount: BN) => {
  const totalCount = upvotesCount.add(downvotesCount);
  if (totalCount.eq(ZERO)) return 0;

  const per = upvotesCount.toNumber() / totalCount.toNumber() * 100;
  const ceilPer = Math.ceil(per);

  if (per >= 50) {
    return {
      percantage: ceilPer,
      color: 'green'
    };
  } else {
    return {
      percantage: 100 - ceilPer,
      color: 'red'
    };
  }
};
