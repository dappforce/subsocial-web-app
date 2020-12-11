import { AnyAddress, stringifyAddress } from '../substrate'
import { newLogger, notDef } from '@subsocial/utils'
import { slugifyHandle, stringifySubUrls } from './helpers'
import { createPostSlug, HasTitleOrBody } from '../posts/slugify'
import { EntityId, HasHandle, HasId, PostStruct } from 'src/types'

const log = newLogger('URL helpers')

// Space URLs
// --------------------------------------------------

export type HasSpaceIdOrHandle = HasId | HasHandle
/**
 * WARN: It's not recommended to use this hack.
 * You should pass both space's id and handle in order to construct
 * good looking URLs for spaces and posts that support a space handle.
 */
export function newSpaceUrlFixture (id: EntityId): HasSpaceIdOrHandle {
  return { id } as HasSpaceIdOrHandle
}

export function spaceIdForUrl (props: HasSpaceIdOrHandle): string {
  const id = (props as HasId).id
  const handle = (props as HasHandle).handle

  if (notDef(id) && notDef(handle)) {
    log.warn(`${spaceIdForUrl.name}: Both id and handle are undefined`)
    return ''
  }

  return slugifyHandle(handle) || id
}

/** /[spaceId] */
export function spaceUrl (space: HasSpaceIdOrHandle, ...subUrls: string[]): string {
  const idForUrl = spaceIdForUrl(space)
  const ending = stringifySubUrls(...subUrls)
  return '/' + idForUrl + ending
}

/** /[spaceId]/new */
export function newSpaceUrl (space: HasSpaceIdOrHandle): string {
  return spaceUrl(space, 'new')
}

/** /[spaceId]/edit */
export function editSpaceUrl (space: HasSpaceIdOrHandle): string {
  return spaceUrl(space, 'edit')
}

/** /[spaceId]/about */
export function aboutSpaceUrl (space: HasSpaceIdOrHandle): string {
  return spaceUrl(space, 'about')
}

// Post URLs
// --------------------------------------------------

export type HasPostId = Pick<PostStruct, 'id'>

export type HasDataForSlug = {
  struct: HasPostId,
  content?: HasTitleOrBody
}

/** /[spaceId]/posts/new */
export function newPostUrl (space: HasSpaceIdOrHandle): string {
  return spaceUrl(space, 'posts', 'new')
}

/** /[spaceId]/[slug] */
export function postUrl (space: HasSpaceIdOrHandle, { struct, content }: HasDataForSlug, ...subUrls: string[]): string {
  if (notDef(struct.id)) {
    log.warn(`${postUrl.name}: Post id is undefined`)
    return ''
  }

  const slug = createPostSlug(struct.id, content)
  return spaceUrl(space, slug, ...subUrls)
}

/** /[spaceId]/[slug]/edit */
export function editPostUrl (space: HasSpaceIdOrHandle, post: HasDataForSlug): string {
  return postUrl(space, post, 'edit')
}

// Account URLs
// --------------------------------------------------

export type HasAddressOrHandle = {
  address: AnyAddress
}

export function accountIdForUrl ({ address }: HasAddressOrHandle): string {
  if (notDef(address)) {
    log.warn(`${accountIdForUrl.name}: Account address is undefined`)
    return ''
  }

  return stringifyAddress(address) as string
}

function urlWithAccount (baseUrl: string, account: HasAddressOrHandle, ...subUrls: string[]): string {
  return stringifySubUrls(baseUrl, accountIdForUrl(account), ...subUrls)
}

/** /accounts/[address] */
export function accountUrl (account: HasAddressOrHandle, ...subUrls: string[]): string {
  return urlWithAccount('accounts', account, ...subUrls)
}
