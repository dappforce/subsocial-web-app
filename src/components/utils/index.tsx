/* eslint-disable no-mixed-operators */
import BN from 'bn.js';
import { SiteMetaContent } from '../types';
import { parseUrl } from './OffchainUtils';
import { isEmptyStr, newLogger } from '@subsocial/utils'

const log = newLogger('Utils')

// Substrate/Polkadot API utils
// --------------------------------------
import { Options as QueryOptions } from '@polkadot/react-api/hoc/types';

// Parse URLs
// --------------------------------------

// TODO merge this func with `OffchainUtils.parseUrl`
export const parse = async (url: string): Promise<SiteMetaContent | undefined> => {
  if (isEmptyStr(url) || !isLink(url)) return

  try {
    return await parseUrl(url)
  } catch (err) {
    log.warn('Failed to parse URL: %s', url)
    return undefined
  }
}

export const getImageFromIpfs = async (hash: string) => {
  // TODO get image from IPFS cluster
  const raw = await fetch(`http://127.0.0.1:8080/ipfs/${hash}`)
  const data: any = await raw.json()
  const mimetype = data?.mimetype
  const image = data?.image
  const src = `data:${mimetype};base64, ${image}`
  return src
}

export const isLink = (s: string) => {
  const URL_REGEXP = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/gi;
  const regex = new RegExp(URL_REGEXP);

  if (s.match(regex)) {
    return true
  } else {
    return false
  }
}

// TODO move these regexps to another file. Closer to Post Editor?
export const VIMEO_REGEX = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
export const YOUTUBE_REGEXP = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
export const TWITTER_REGEXP = /(?:http:\/\/)?(?:www\.)?twitter\.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w-]*\/)*([\w-]*)/;
export const GIST_REGEXP = /https:\/\/gist.github.com\/[^\/]+\/[^\/]+/;
export const DOMAIN_REGEXP = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img;

import queryString from 'query-string';

export const ZERO = new BN(0);

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

export const socialQueryToProp = (storageItem: string, paramNameOrOpts?: string | QueryOptions) => {
  return queryToProp(`query.social.${storageItem}`, paramNameOrOpts);
};

export function getUrlParam (location: Location, paramName: string, deflt: string | undefined = undefined): string | undefined {
  const params = queryString.parse(location.search);
  return params[paramName] ? params[paramName] as string : deflt;
}

export function isServerSide (): boolean {
  return typeof window === 'undefined'
}

export function isClientSide (): boolean {
  return !isServerSide()
}
