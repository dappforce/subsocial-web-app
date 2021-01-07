/* eslint-disable no-mixed-operators */
import BN from 'bn.js'
import queryString from 'query-string'
import React from 'react'
import { Option } from '@polkadot/types'
import { LoadingOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { Profile, SocialAccount } from '@subsocial/types/substrate/interfaces'
import { ProfileContent } from '@subsocial/types/offchain'
import { isMyAddress } from '../auth/MyAccountContext'
import { AnyAccountId } from '@subsocial/types'
import { hexToBn } from '@polkadot/util'
import Error from 'next/error'
import isbot from 'isbot'
import { PostStruct, SpaceStruct } from 'src/types'
export * from './IconWithLabel'

export const ZERO = new BN(0)
export const ONE = new BN(1)

// Substrate/Polkadot API utils
// --------------------------------------

// Parse URLs
// --------------------------------------

export function getUrlParam (location: Location, paramName: string, deflt?: string): string | undefined {
  const params = queryString.parse(location.search)
  return params[paramName] ? params[paramName] as string : deflt
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
    return <Component {...props} requireProfile />
  }
}

type LoadingProps = {
  label?: React.ReactNode
  style?: React.CSSProperties
  center?: boolean
}

export const Loading = ({ label, style, center = true }: LoadingProps) => {
  const alignCss = center ? 'justify-content-center align-items-center' : ''
  return <div className={`d-flex w-100 h-100 ${alignCss}`} style={style}>
    <LoadingOutlined />
    {label && <em className='ml-3 text-muted'>{label}</em>}
  </div>
}

export const DEFAULT_DATE_FORMAT = 'lll'

export const formatDate = (date: dayjs.ConfigType | BN, format = DEFAULT_DATE_FORMAT) => {
  date = BN.isBN(date) ? date.toNumber() : date
  return dayjs(date).format(format)
}

/**
 * Generate a temporary comment id that will be used on UI until comment is persisted
 * in the blockchain and replaced with the real data and id from blockchain storage.
 */
export const tmpClientId = () => `fake-id-${new Date().getTime()}`

type VisibilityProps = {
  struct: PostStruct | SpaceStruct
  address?: AnyAccountId
}

export const isVisible = ({ struct: { hidden, ownerId }, address }: VisibilityProps) =>
  !hidden || isMyAddress(address || ownerId)

export const isHidden = (props: VisibilityProps) => !isVisible(props)

export const toShortAddress = (_address: AnyAccountId) => {
  const address = (_address || '').toString()

  return address.length > 13 ? `${address.slice(0, 6)}…${address.slice(-6)}` : address
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
  const totalCount = upvotesCount.add(downvotesCount)
  if (totalCount.eq(ZERO)) return 0

  const per = upvotesCount.toNumber() / totalCount.toNumber() * 100
  const ceilPer = Math.ceil(per)

  if (per >= 50) {
    return {
      percantage: ceilPer,
      color: 'green'
    }
  } else {
    return {
      percantage: 100 - ceilPer,
      color: 'red'
    }
  }
}

export const resolveBn = (value: BN | string) => {
  try {
    return new BN(value)
  } catch {
    return hexToBn(value.toString())
  }
}

export const PageNotFound = () => <Error statusCode={404} />
