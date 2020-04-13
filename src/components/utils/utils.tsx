import React, { useState, useEffect } from 'react';
import { Pagination as SuiPagination } from 'semantic-ui-react';

import { Option, GenericAccountId } from '@polkadot/types';
import { SubmittableResult } from '@polkadot/api';
import { useRouter } from 'next/router';
import { Icon } from 'antd';
import { NoData } from './EmptyList';
import moment from 'moment-timezone';
import AccountId from '@polkadot/types/generic/AccountId';
import { registry } from '@polkadot/react-api';
import BN from 'bn.js';
import { Profile, SocialAccount } from '@subsocial/types/substrate/interfaces';
import { ProfileContent } from '@subsocial/types/offchain';
import { newLogger } from '@subsocial/utils';
import { Moment } from '@polkadot/types/interfaces';
import { SubsocialSubstrateApi } from '@subsocial/api/substrate';
import { useSubsocialApi } from './SubsocialApiContext';
import { getSubsocialApi } from './SubsocialConnect';

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

type LoadProps = {
  id: AccountId;
};

export function withAddressFromUrl (Component: React.ComponentType<LoadProps>) {
  return function (props: LoadProps) {
    const router = useRouter();
    const { address } = router.query;
    try {
      return <Component id={new GenericAccountId(registry, address as string)} {...props}/>;
    } catch (err) {
      return <em>Invalid address: {address}</em>;
    }
  };
}

type PropsWithSocialAccount = {
  profile?: Profile;
  ProfileContent?: ProfileContent;
  socialAccount?: SocialAccount;
  requireProfile?: boolean;
};

type LoadSocialAccount = PropsWithSocialAccount & {
  socialAccountOpt?: Option<SocialAccount>;
};

export function withSocialAccount<P extends LoadSocialAccount> (Component: React.ComponentType<P>) {
  const log = newLogger('Social account HOC')
  return function (props: P) {
    const { socialAccountOpt, requireProfile = false } = props;

    if (!socialAccountOpt) return <Loading />;
    else if (socialAccountOpt.isNone && requireProfile) return <NoData description={<span>You have not created profile yet</span>} />;
    else if (socialAccountOpt.isNone) return <Component {...props} />;

    const socialAccount = socialAccountOpt.unwrap();
    const profileOpt = socialAccount.profile;

    if (profileOpt.isNone && requireProfile) return <NoData description={<span>You have not created profile yet</span>} />;
    else if (profileOpt.isNone) return <Component {...props} socialAccount={socialAccount}/>;

    const profile = profileOpt.unwrap() as Profile;

    const ipfsHash = profile.ipfs_hash;
    const { ipfs } = useSubsocialApi()
    const [ ProfileContent, setProfileContent ] = useState(undefined as (ProfileContent | undefined));

    useEffect(() => {
      if (!ipfsHash) return;

      let isSubscribe = true;
      const loadContent = async () => {
        const content = await ipfs.getContent<ProfileContent>(profile.ipfs_hash)
        isSubscribe && content && setProfileContent(content);
      }

      loadContent().catch(err => log.error('Failed to load profile content:', err));

      return () => { isSubscribe = false; };
    }, [ false ]);

    if (requireProfile && !ProfileContent) return <Loading />;

    return <Component {...props} socialAccount={socialAccount} profile={profile} ProfileContent={ProfileContent} />;
  };
}

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

export function getEnv (varName: string): string | undefined {
  const { env } = typeof window === 'undefined' ? process : window.process;
  return env[varName]
}
