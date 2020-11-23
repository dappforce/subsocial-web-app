import { Options as QueryOptions } from '../hoc/types'
import { PalletName } from '@subsocial/types'

/** Example of apiQuery: 'query.councilElection.round' */
export function queryToProp (
  apiQuery: string,
  paramNameOrOpts?: string | QueryOptions
): [ string, QueryOptions ] {
  let paramName: string | undefined
  let propName: string | undefined

  if (typeof paramNameOrOpts === 'string') {
    paramName = paramNameOrOpts
  } else if (paramNameOrOpts) {
    paramName = paramNameOrOpts.paramName
    propName = paramNameOrOpts.propName
  }

  // If prop name is still undefined, derive it from the name of storage item:
  if (!propName) {
    propName = apiQuery.split('.').slice(-1)[0]
  }

  return [ apiQuery, { paramName, propName } ]
}

const palletQueryToProp = (pallet: PalletName, storageItem: string, paramNameOrOpts?: string | QueryOptions) => {
  return queryToProp(`query.${pallet}.${storageItem}`, paramNameOrOpts)
}

export const postsQueryToProp = (storageItem: string, paramNameOrOpts?: string | QueryOptions) => {
  return palletQueryToProp('posts', storageItem, paramNameOrOpts)
}

export const spacesQueryToProp = (storageItem: string, paramNameOrOpts?: string | QueryOptions) => {
  return palletQueryToProp('spaces', storageItem, paramNameOrOpts)
}

export const spaceFollowsQueryToProp = (storageItem: string, paramNameOrOpts?: string | QueryOptions) => {
  return palletQueryToProp('spaceFollows', storageItem, paramNameOrOpts)
}

export const profilesQueryToProp = (storageItem: string, paramNameOrOpts?: string | QueryOptions) => {
  return palletQueryToProp('profiles', storageItem, paramNameOrOpts)
}

export const profileFollowsQueryToProp = (storageItem: string, paramNameOrOpts?: string | QueryOptions) => {
  return palletQueryToProp('profileFollows', storageItem, paramNameOrOpts)
}

export const reactionsQueryToProp = (storageItem: string, paramNameOrOpts?: string | QueryOptions) => {
  return palletQueryToProp('reactions', storageItem, paramNameOrOpts)
}
