import BN from 'bn.js';
import substrateLogo from '@polkadot/ui-assets/notext-parity-substrate-white.svg';

export const SITE_NAME = 'Subsocial Network';

export const ZERO = new BN(0);

export function bnToStr (bn?: BN, dflt: string = ''): string {
  return bn ? bn.toString() : dflt;
}

// String, Numbers, Object
// --------------------------------------

export const isDefined = (x: any): boolean =>
  !notDefined(x);

export const isDef = isDefined;

export const notDefined = (x: any): boolean =>
  x === null || typeof x === 'undefined';

export const notDef = notDefined;

export const isObj = (x: any): boolean =>
  x !== null && typeof x === 'object';

export const isStr = (x: any): boolean =>
  typeof x === 'string';

export const isNum = (x: any): boolean =>
  typeof x === 'number';

export const isEmptyStr = (x: any): boolean =>
  notDefined(x) || isStr(x) && x.trim().length === 0;

export const nonEmptyStr = (x?: any) =>
  isStr(x) && x.trim().length > 0;

export const parseNumStr = (num: string): number | undefined => {
  try {
    return parseInt(num, undefined);
  } catch (err) {
    return undefined;
  }
};

export const nonEmptyArr = (x: any): boolean =>
  Array.isArray(x) && x.length > 0;

// Keyring stuff:
// --------------------------------------

import keyring from '@polkadot/ui-keyring';

export function findNameByAddress (address: string): string | undefined {
  try {
    return keyring.getAccount(address).getMeta().name;
  } catch (error) {
    try {
      return keyring.getAddress(address).getMeta().name;
    } catch (error) {
      // ok, we don't have account or address
      return undefined;
    }
  }
}

// Substrate/Polkadot API utils
// --------------------------------------
import { Options as QueryOptions } from '@polkadot/ui-api/with/types';

/** Example of apiQuery: 'query.councilElection.round' */
export function queryToProp (
  apiQuery: string,
  paramNameOrOpts?: string | QueryOptions
): [ string, QueryOptions ] {

  let paramName: string | undefined;
  let propName: string | undefined;

  if (typeof paramNameOrOpts === 'string') {
    paramName = paramNameOrOpts;
  } else if (paramNameOrOpts) {
    paramName = paramNameOrOpts.paramName;
    propName = paramNameOrOpts.propName;
  }

  // If prop name is still undefined, derive it from the name of storage item:
  if (!propName) {
    propName = apiQuery.split('.').slice(-1)[0];
  }

  return [ apiQuery, { paramName, propName } ];
}

export const queryBlogsToProp = (storageItem: string, paramNameOrOpts?: string | QueryOptions) => {
  return queryToProp(`query.blogs.${storageItem}`, paramNameOrOpts);
};

// Parse URLs
// --------------------------------------

import queryString from 'query-string';
import Head from 'next/head';

export function getUrlParam (location: Location, paramName: string, deflt: string | undefined = undefined): string | undefined {
  const params = queryString.parse(location.search);
  return params[paramName] ? params[paramName] as string : deflt;
}

type SeoProps = {
  name?: string,
  image?: string,
  title?: string,
  desc?: string
};

import React from 'react';

// Google typically displays the first 50–60 characters of a title tag. If you keep your titles under 60 characters, our research suggests that you can expect about 90% of your titles to display properly.

export const createTitle = (title: string) => `${title.length <= 50 ? title : title.substr(0, 50)} - Subsocial`;

export function SeoHeads (props: SeoProps) {
  const { name = '', image = substrateLogo, title = '', desc = '' } = props;
  return <div>
    <Head>
      <title>{createTitle(name)}</title>
      <meta property='og:site_name' content={SITE_NAME} />
      <meta property='og:image' content={image} />
      <meta property='og:title' content={name} />
      <meta property='og:description' content={desc} />
      <meta name='twitter:site' content={SITE_NAME} />
      <meta name='twitter:image' content={image} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={desc} />
    </Head>
  </div>;
}
