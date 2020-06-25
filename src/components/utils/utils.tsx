import React from 'react';
import { Option } from '@polkadot/types';
import { Icon } from 'antd';
import moment from 'moment-timezone';
import BN from 'bn.js';
import { Profile, SocialAccount } from '@subsocial/types/substrate/interfaces';
import { ProfileContent } from '@subsocial/types/offchain';
import { Moment } from '@polkadot/types/interfaces';

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

export const Loading = () => <Icon type='loading' />;

export const formatUnixDate = (_seconds: number | BN | Moment, format: string = 'lll') => {
  const seconds = typeof _seconds === 'number' ? _seconds : _seconds.toNumber()
  return moment(new Date(seconds)).format(format);
};
