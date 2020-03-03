/* eslint-disable no-mixed-operators */
import BN from 'bn.js';

// Substrate/Polkadot API utils
// --------------------------------------
import { Options as QueryOptions } from '@polkadot/react-api/hoc/types';

// Parse URLs
// --------------------------------------

import queryString from 'query-string';

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
