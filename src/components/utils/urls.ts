import { Space, Post, SpaceId } from '@subsocial/types/substrate/interfaces'
import { stringifyText, stringifyNumber, AnyAddress, AnyText, stringifyAddress } from '../substrate'
import { newLogger, nonEmptyStr, notDef, nonEmptyArr } from '@subsocial/utils'
import BN from 'bn.js'

const log = newLogger('URLs')

function slugify (text?: AnyText): string | undefined {
  let slug: string | undefined
  if (nonEmptyStr(text)) {
    slug = stringifyText(text)
    if (slug && !slug.startsWith('@')) {
      slug = '@' + slug
    }
  }
  return slug
}

function stringifySubUrls (...subUrls: string[]): string {
  if (nonEmptyArr(subUrls)) {
    const res: string[] = [ '' ]
    subUrls.forEach(url => {
      if (nonEmptyStr(url)) {
        if (url.startsWith('/')) {
          url = url.substring(1) // Drop the first '/'
        }
        res.push(url)
      }
    })
    return res.join('/')
  }
  return ''
}

// Space URLs
// --------------------------------------------------

export type HasSpaceIdOrHandle = Pick<Space, 'id' | 'handle'>

/**
 * WARN: It's not recommended to use this hack.
 * You should pass both space's id and handle in order to construct
 * good looking URLs for spaces and posts that support a space handle.
 */
export function newSpaceUrlFixture (id: SpaceId | BN): HasSpaceIdOrHandle {
  return { id } as HasSpaceIdOrHandle
}

export function spaceIdForUrl ({ id, handle }: HasSpaceIdOrHandle): string {
  if (notDef(id) && notDef(handle)) {
    log.warn(`${spaceIdForUrl.name}: Both id and handle are undefined`)
    return ''
  }

  return slugify(handle) || stringifyNumber(id) as string
}

/** /spaces/[spaceId] */
export function spaceUrl (space: HasSpaceIdOrHandle, ...subUrls: string[]): string {
  const idForUrl = spaceIdForUrl(space)
  const ending = stringifySubUrls(...subUrls)
  return '/spaces/' + idForUrl + ending
}

/** /spaces/[spaceId]/new */
export function newSpaceUrl (space: HasSpaceIdOrHandle): string {
  return spaceUrl(space, 'new')
}

/** /spaces/[spaceId]/edit */
export function editSpaceUrl (space: HasSpaceIdOrHandle): string {
  return spaceUrl(space, 'edit')
}

/** /spaces/[spaceId]/about */
export function aboutSpaceUrl (space: HasSpaceIdOrHandle): string {
  return spaceUrl(space, 'about')
}

// Post URLs
// --------------------------------------------------

export type HasPostId = Pick<Post, 'id'>

/** /spaces/[spaceId]/posts/new */
export function newPostUrl (space: HasSpaceIdOrHandle): string {
  return spaceUrl(space, 'posts', 'new')
}

/** /spaces/[spaceId]/posts/[postId] */
export function postUrl (space: HasSpaceIdOrHandle, post: HasPostId, ...subUrls: string[]): string {
  if (notDef(post.id)) {
    log.warn(`${postUrl.name}: Post id is undefined`)
    return ''
  }

  const postId = stringifyNumber(post.id) as string
  return spaceUrl(space, 'posts', postId, ...subUrls)
}

/** /spaces/[spaceId]/posts/[postId]/edit */
export function editPostUrl (space: HasSpaceIdOrHandle, post: HasPostId): string {
  return postUrl(space, post, 'edit')
}

// Account URLs
// --------------------------------------------------

export type HasAddressOrHandle = {
  address: AnyAddress
  handle?: AnyText
}

export function accountIdForUrl ({ address, handle }: HasAddressOrHandle, ...subUrls: string[]): string {
  if (notDef(address) && notDef(handle)) {
    log.warn(`${accountIdForUrl.name}: Both address and handle are undefined`)
    return ''
  }

  return slugify(handle) || stringifyAddress(address) as string
}

function urlWithAccount (baseUrl: string, account: HasAddressOrHandle, ...subUrls: string[]): string {
  return stringifySubUrls(baseUrl, accountIdForUrl(account), ...subUrls)
}

/** /profile/[address] */
export function accountUrl (account: HasAddressOrHandle, ...subUrls: string[]): string {
  return urlWithAccount('profile', account, ...subUrls)
}

/** /spaces/my/[address] */
export function spacesOwnedByAccountUrl (account: HasAddressOrHandle, ...subUrls: string[]): string {
  return urlWithAccount('spaces/my', account, ...subUrls)
}

/** /spaces/following/[address] */
export function spacesFollowedByAccountUrl (account: HasAddressOrHandle, ...subUrls: string[]): string {
  return urlWithAccount('spaces/following', account, ...subUrls)
}
