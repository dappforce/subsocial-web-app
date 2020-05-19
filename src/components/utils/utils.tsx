import React from 'react';
import { Pagination as SuiPagination } from 'semantic-ui-react';
import { Option, GenericAccountId } from '@polkadot/types';
import { SubmittableResult } from '@polkadot/api';
import { Icon } from 'antd';
import moment from 'moment-timezone';
import AccountId from '@polkadot/types/generic/AccountId';
import { registry } from '@subsocial/react-api';
import BN from 'bn.js';
import { Profile, SocialAccount } from '@subsocial/types/substrate/interfaces';
import { ProfileContent } from '@subsocial/types/offchain';
import { Moment } from '@polkadot/types/interfaces';
import { getSubsocialApi } from './SubsocialConnect';
import { AddressProps } from '../profiles/address-views/utils/types';
import { toShortAddress } from '@subsocial/react-components/util';
import { SubstrateId } from '@subsocial/types';
import { Codec } from '@polkadot/types/types';

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

export function getNewIdFromEvent (
  _txResult: SubmittableResult
): BN | undefined {
  let id: BN | undefined;

  _txResult.events.find(event => {
    const {
      event: { data, method }
    } = event;
    if (method.indexOf(`Created`) >= 0) {
      const [ /* owner */, newId ] = data.toArray();
      id = newId as unknown as BN;
      return true;
    }
    return false;
  });

  return id;
}

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

export const Loading = () => <Icon type='loading' />;

export const formatUnixDate = (_seconds: number | BN | Moment, format: string = 'lll') => {
  const seconds = typeof _seconds === 'number' ? _seconds : _seconds.toNumber()
  return moment(new Date(seconds)).format(format);
};

export const getBlogId = async (idOrHandle: string): Promise<BN | undefined> => {
  if (idOrHandle.startsWith('@')) {
    const handle = idOrHandle.substring(1) // Drop '@'
    const { substrate } = await getSubsocialApi()
    return substrate.getBlogIdByHandle(handle)
  } else {
    return new BN(idOrHandle)
  }
}

export const getAccountId = async (addressOrHandle: string): Promise<AccountId | undefined> => {
  if (addressOrHandle.startsWith('@')) {
    const handle = addressOrHandle.substring(1) // Drop '@'
    const { substrate } = await getSubsocialApi()
    return substrate.getAccountIdByHandle(handle)
  } else {
    return new GenericAccountId(registry, addressOrHandle)
  }
}

export function equalAddresses (addr1?: string | AccountId, addr2?: string | AccountId) {
  return addr1?.toString() === addr2?.toString()
}

type GetNameOptions = AddressProps & {
  isShort?: boolean
}

export const getProfileName = (options: GetNameOptions) => {
  const { owner, isShort = true, address } = options;
  return (owner?.content?.fullname || owner?.profile?.username || (isShort ? toShortAddress(address) : address)).toString()
}

export const unwrapSubstrateId = (optId?: Option<Codec>): SubstrateId | undefined => {
  if (optId instanceof Option) {
    return optId.unwrapOr(undefined) as any
  }

  return optId && optId as SubstrateId
}
