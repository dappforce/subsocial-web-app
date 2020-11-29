import { PostContent } from '@subsocial/types'
import { nonEmptyStr } from '@subsocial/utils'
import slugify from '@sindresorhus/slugify'
import { summarize } from 'src/utils'
import { EntityId } from 'src/types'

const MAX_SLUG_LENGTH = 60
const SLUG_SEPARATOR = '-'

export type HasTitleOrBody = Pick<PostContent, 'body' | 'title'>

export const createPostSlug = (postId: EntityId, content?: HasTitleOrBody) => {
  let slug: string = '' + postId

  if (content) {
    const { title, body } = content
    const titleOrBody = nonEmptyStr(title) ? title : body
    const summary = summarize(titleOrBody, { limit: MAX_SLUG_LENGTH, omission: '' })
    slug = slugify(summary, { separator: SLUG_SEPARATOR }) + '-' + slug
  }

  return slug
}

export const getPostIdFromSlug = (slug: string): EntityId | undefined => {
  return slug.split(SLUG_SEPARATOR).pop()
}
