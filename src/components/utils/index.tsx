/* eslint-disable no-mixed-operators */
import BN from 'bn.js'
import queryString from 'query-string'
import React from 'react';
import { Option } from '@polkadot/types';
import { LoadingOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';
import { Profile, SocialAccount, Post, Space } from '@subsocial/types/substrate/interfaces';
import { ProfileContent } from '@subsocial/types/offchain';
import { Moment } from '@polkadot/types/interfaces';
import { isMyAddress } from '../auth/MyAccountContext';
import { AnyAccountId } from '@subsocial/types';
import { hexToBn } from '@polkadot/util'
import isbot from 'isbot'
export * from './IconWithLabel'

export const ZERO = new BN(0)
export const ONE = new BN(1)

// Substrate/Polkadot API utils
// --------------------------------------

// Parse URLs
// --------------------------------------

export function getUrlParam (location: Location, paramName: string, deflt?: string): string | undefined {
  const params = queryString.parse(location.search);
  return params[paramName] ? params[paramName] as string : deflt;
}

// Next.js utils
// --------------------------------------

export function isServerSide (): boolean {
  return typeof window === 'undefined'
}

export function isClientSide (): boolean {
  return !isServerSide()
}

export const isHomePage = (): boolean =>
  isClientSide() && window.location.pathname === '/'

export const isBot = () => isClientSide() ? isbot(window.navigator.userAgent) : false

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

type LoadingProps = {
  label?: React.ReactNode
}

export const Loading = ({ label }: LoadingProps) =>
  <div className='d-flex justify-content-center align-items-center w-100 h-100'>
    <LoadingOutlined />
    {label && <em className='ml-3 text-muted'>{label}</em>}
  </div>

export const formatUnixDate = (_seconds: number | BN | Moment, format: string = 'lll') => {
  const seconds = typeof _seconds === 'number' ? _seconds : _seconds.toNumber()
  return moment(new Date(seconds)).format(format);
};

export function functionStub (): any {
  throw new Error('Function needs to be set in ApiProvider')
}

export const fakeClientId = () => `fake-${new Date().getTime().toString()}`

type VisibilityProps = {
  struct: Post | Space
  address?: AnyAccountId
}

export const isVisible = ({ struct: { hidden, owner }, address }: VisibilityProps) =>
  !hidden.valueOf() || isMyAddress(address || owner)

export const isHidden = (props: VisibilityProps) => !isVisible(props)

export const toShortAddress = (_address: AnyAccountId) => {
  const address = (_address || '').toString();

  return address.length > 13 ? `${address.slice(0, 6)}…${address.slice(-6)}` : address;
}

export const gtZero = (n?: BN | number | string): boolean => {
  if (typeof n === 'undefined') return false

  if (typeof n === 'number') {
    return n > 0
  } else {
    try {
      const bn = new BN(n)
      return bn.gt(ZERO)
    } catch {
      return false
    }
  }
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

export const resolveBn = (value: BN | string) => {
  try {
    return new BN(value)
  } catch {
    return hexToBn(value.toString())
  }
}

export const startWithUpperCase = (str: string) => str.replace(/(?:^\s*|\s+)(\S?)/g, (b) => b.toUpperCase())

export const GhostPrimaryBtnClass = 'ant-btn ant-btn-primary ant-btn-background-ghost'
