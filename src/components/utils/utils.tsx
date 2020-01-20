import React, { useState, useEffect } from 'react';
import { Pagination as SuiPagination } from 'semantic-ui-react';

import { AccountId, Option } from '@polkadot/types';
import { SubmittableResult } from '@polkadot/api';
import { api as webApi } from '@polkadot/ui-api';
import { CommentId, PostId, BlogId, Profile, ProfileContent, SocialAccount } from '../types';
import { getJsonFromIpfs } from './OffchainUtils';
import { useRouter } from 'next/router';
import { Icon } from 'antd';
import { NoData } from './DataList';
import moment from 'moment-timezone';
import Api from './SubstrateApi';

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

export function getNewIdFromEvent<IdType extends BlogId | PostId | CommentId> (
  _txResult: SubmittableResult
): IdType | undefined {
  let id: IdType | undefined;

  _txResult.events.find(event => {
    const {
      event: { data, method }
    } = event;
    if (method.indexOf(`Created`) >= 0) {
      const [, /* owner */ newId] = data.toArray();
      id = newId as IdType;
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
      return <Component id={new AccountId(address as string)} {...props}/>;
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
    else if (profileOpt.isNone) return <Component {...props} />;

    const profile = profileOpt.unwrap() as Profile;

    const ipfsHash = profile.ipfs_hash;
    const [ProfileContent, setProfileContent] = useState(undefined as (ProfileContent | undefined));

    useEffect(() => {
      if (!ipfsHash) return;

      let isSubscribe = true;
      getJsonFromIpfs<ProfileContent>(ipfsHash)
        .then(json => {
          isSubscribe && setProfileContent(json);
        })
        .catch(err => console.log(err));

      return () => { isSubscribe = false; };
    }, [false]);

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

export const getApi = async () => {
  return webApi ? webApi.isReady : Api.setup();
};

export const formatUnixDate = (seconds: number, format: string = 'lll') => {
  return moment(new Date(seconds * 1000)).format(format);
};
