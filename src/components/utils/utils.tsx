import React from 'react';
import { Pagination as SuiPagination } from 'semantic-ui-react';
import { Option } from '@polkadot/types';
import { Icon } from 'antd';
import moment from 'moment-timezone';
import BN from 'bn.js';
import { Profile, SocialAccount, Post, Space } from '@subsocial/types/substrate/interfaces';
import { ProfileContent } from '@subsocial/types/offchain';
import { Moment } from '@polkadot/types/interfaces';
import { isMyAddress } from '../auth/MyAccountContext';
import { AnyAccountId } from '@subsocial/types';

type PaginationProps = {
  currentPage?: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (activePage?: string | number) => void;
};

export const Pagination = (p: PaginationProps) => {
  const { currentPage = 1, itemsPerPage = 20 } = p;
  const totalPages = Math.floor(p.totalItems / itemsPerPage);

  return totalPages <= 1 ? null : (
    <SuiPagination
      firstItem={null}
      lastItem={null}
      defaultActivePage={currentPage}
      totalPages={totalPages}
      onPageChange={(_event, { activePage }) => p.onPageChange(activePage)}
    />
  );
};

export type UrlHasIdProps = {
  match: {
    params: {
      id: string;
    };
  };
};

export type UrlHasAddressProps = {
  match: {
    params: {
      address: string;
    };
  };
};

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
