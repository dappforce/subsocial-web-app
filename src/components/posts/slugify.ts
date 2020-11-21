import { PostContent } from '@subsocial/types'
import { isEmptyStr, nonEmptyStr } from '@subsocial/utils'
import slugify from '@sindresorhus/slugify'
import BN from 'bn.js'
import { summarize } from 'src/utils'
import Router from 'next/router'

const MAX_SLUG_LENGTH = 60
const SLUG_SEPARATOR = '-'

export type HasTitleOrBody = Pick<PostContent, 'body' | 'title'>

export const createPostSlug = (postId: BN, content?: HasTitleOrBody) => {
  let slug = ''
  if (content) {
    const { title, body } = content

    const text = nonEmptyStr(title)
      ? title 
      : body

    slug = slugify(summarize(text, { limit: MAX_SLUG_LENGTH, omission: '' }), { separator: SLUG_SEPARATOR })
  }

  return isEmptyStr(slug)
    ? postId.toString()
    : `${slug}-${postId}`
}

export const getPostIdFromSlug = (slug: string) => {
  const postId = slug.split(SLUG_SEPARATOR).pop()

  if (!postId) throw new Error('Post id not found in post slug')

  return new BN(postId)
}

export const getPostIdFromUrl = () => {
  const { slug } = Router.query

  return getPostIdFromSlug(slug as string) 
}
