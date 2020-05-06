import { Blog, Post, Comment, BlogId } from '@subsocial/types/substrate/interfaces'
import { stringifyText, stringifyNumber, AnyAddress, AnyText, stringifyAddress } from './substrate'
import { newLogger, nonEmptyStr, notDef, nonEmptyArr } from '@subsocial/utils'

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

// Blog URLs
// --------------------------------------------------

export type HasBlogIdOrHandle = Pick<Blog, 'id' | 'handle'>

/**
 * WARN: It's not recommended to use this hack.
 * You should pass both blog's id and handle in order to construct
 * good looking URLs for blogs and posts that support a blog handle.
 */
export function newBlogUrlFixture (id: BlogId): HasBlogIdOrHandle {
  return { id } as HasBlogIdOrHandle
}

export function blogIdForUrl ({ id, handle }: HasBlogIdOrHandle): string {
  if (notDef(id) && notDef(handle)) {
    log.warn(`${blogIdForUrl.name}: Both id and handle are undefined`)
    return ''
  }

  return slugify(handle) || stringifyNumber(id) as string
}

/** /blogs/[blogId] */
export function blogUrl (blog: HasBlogIdOrHandle, ...subUrls: string[]): string {
  const idForUrl = blogIdForUrl(blog)
  const ending = stringifySubUrls(...subUrls)
  return '/blogs/' + idForUrl + ending
}

/** /blogs/[blogId]/new */
export function newBlogUrl (blog: HasBlogIdOrHandle): string {
  return blogUrl(blog, 'new')
}

/** /blogs/[blogId]/edit */
export function editBlogUrl (blog: HasBlogIdOrHandle): string {
  return blogUrl(blog, 'edit')
}

/** /blogs/[blogId]/about */
export function aboutBlogUrl (blog: HasBlogIdOrHandle): string {
  return blogUrl(blog, 'about')
}

// Post URLs
// --------------------------------------------------

export type HasPostId = Pick<Post, 'id'>

/** /blogs/[blogId]/posts/new */
export function newPostUrl (blog: HasBlogIdOrHandle): string {
  return blogUrl(blog, 'posts', 'new')
}

/** /blogs/[blogId]/posts/[postId] */
export function postUrl (blog: HasBlogIdOrHandle, post: HasPostId, ...subUrls: string[]): string {
  if (notDef(post.id)) {
    log.warn(`${postUrl.name}: Post id is undefined`)
    return ''
  }

  const postId = stringifyNumber(post.id) as string
  return blogUrl(blog, 'posts', postId, ...subUrls)
}

/** /blogs/[blogId]/posts/[postId]/edit */
export function editPostUrl (blog: HasBlogIdOrHandle, post: HasPostId): string {
  return postUrl(blog, post, 'edit')
}

// Comment URLs
// --------------------------------------------------

export type HasCommentId = Pick<Comment, 'id'>

/** /blogs/[blogId]/posts/[postId]/comments */
export function postCommentsUrl (blog: HasBlogIdOrHandle, post: HasPostId): string {
  return postUrl(blog, post, 'comments')
}

/** /blogs/[blogId]/posts/[postId]/comments/[commentId] */
export function commentUrl (blog: HasBlogIdOrHandle, post: HasPostId, comment: HasCommentId): string {
  if (notDef(comment.id)) {
    log.warn(`${commentUrl.name}: Comment id is undefined`)
    return ''
  }

  const commentId = stringifyNumber(comment.id) as string
  return postUrl(blog, post, 'comments', commentId)
}

// Account URLs
// --------------------------------------------------

export type HasAddressOrUsername = {
  address: AnyAddress
  username?: AnyText
}

export function accountIdForUrl ({ address, username }: HasAddressOrUsername, ...subUrls: string[]): string {
  if (notDef(address) && notDef(username)) {
    log.warn(`${accountIdForUrl.name}: Both address and username are undefined`)
    return ''
  }

  return slugify(username) || stringifyAddress(address) as string
}

function urlWithAccount (baseUrl: string, account: HasAddressOrUsername, ...subUrls: string[]): string {
  return stringifySubUrls(baseUrl, accountIdForUrl(account), ...subUrls)
}

/** /profile/[address] */
export function accountUrl (account: HasAddressOrUsername, ...subUrls: string[]): string {
  return urlWithAccount('profile', account, ...subUrls)
}

/** /blogs/my/[address] */
export function blogsOwnedByAccountUrl (account: HasAddressOrUsername, ...subUrls: string[]): string {
  return urlWithAccount('blogs/my', account, ...subUrls)
}

/** /blogs/following/[address] */
export function blogsFollowedByAccountUrl (account: HasAddressOrUsername, ...subUrls: string[]): string {
  return urlWithAccount('blogs/following', account, ...subUrls)
}
