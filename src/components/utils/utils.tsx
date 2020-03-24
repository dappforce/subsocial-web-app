import React, { useState, useEffect } from 'react';
import { Pagination as SuiPagination } from 'semantic-ui-react';

import { Option, GenericAccountId } from '@polkadot/types';
import { SubmittableResult } from '@polkadot/api';
import { ipfs, substrate } from './SubsocialConnect';
import { useRouter } from 'next/router';
import { Icon } from 'antd';
import { NoData } from './DataList';
import moment from 'moment-timezone';
import mdToText from 'markdown-to-txt';
import { truncate } from 'lodash';
import AccountId from '@polkadot/types/generic/AccountId';
import { registry } from '@polkadot/react-api';
import BN from 'bn.js';
import { Profile, SocialAccount, BlogId } from '@subsocial/types/substrate/interfaces';
import { ProfileContent } from '@subsocial/types/offchain';
import { getFirstOrUndefinded } from '@subsocial/api/utils';
import { Moment } from '@polkadot/types/interfaces';

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
  return function (props: P) {
    const { socialAccountOpt, requireProfile = false } = props;

    if (socialAccountOpt === undefined) return <Loading />;
    else if (socialAccountOpt.isNone && requireProfile) return <NoData description={<span>You have not created profile yet</span>} />;
    else if (socialAccountOpt.isNone) return <Component {...props} />;

    const socialAccount = socialAccountOpt.unwrap();
    const profileOpt = socialAccount.profile;

    if (profileOpt.isNone && requireProfile) return <NoData description={<span>You have not created profile yet</span>} />;
    else if (profileOpt.isNone) return <Component {...props} socialAccount={socialAccount}/>;

    const profile = profileOpt.unwrap() as Profile;

    const ipfsHash = profile.ipfs_hash;
    const [ ProfileContent, setProfileContent ] = useState(undefined as (ProfileContent | undefined));

    useEffect(() => {
      if (!ipfsHash) return;

      let isSubscribe = true;
      const loadContent = async () => {
        const content = getFirstOrUndefinded(await ipfs.getContentArray<ProfileContent>([ profile.ipfs_hash ]));
        isSubscribe && content && setProfileContent(content);
      }

      loadContent().catch(console.log);

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

const DEFAULT_SUMMARY_LENGTH = 300;

export const summarize = (body: string, limit: number = DEFAULT_SUMMARY_LENGTH) => {
  const text = mdToText(body);
  return text.length > limit
    ? truncate(text, {
      length: limit,
      separator: /.,:;!?\(\)\[\]\{\} +/
    })
    : text;
};

export const getBlogId = async (idOrSlug: string): Promise<BN | undefined> => {
  if (idOrSlug.startsWith('@')) {
    const slug = idOrSlug.substring(1) // Drop '@'
    const idOpt = await substrate.socialQuery().blogIdBySlug(slug) as Option<BlogId>
    return idOpt.unwrapOr(undefined)
  } else {
    return new BN(idOrSlug)
  }
}

export function getEnv (varName: string): string | undefined {
  const { env } = typeof window === 'undefined' ? process : window.process;
  return env[varName]
}
