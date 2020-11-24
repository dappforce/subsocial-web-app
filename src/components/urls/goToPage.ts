import { AnySpaceId } from '@subsocial/types'
import { newLogger } from '@subsocial/utils'
import Router from 'next/router'
import { HasSpaceIdOrHandle } from '.'
import { createNewPostLinkProps } from '../spaces/helpers'

const log = newLogger('Go to page')

export function goToSpacePage (spaceId: AnySpaceId) {
  Router.push('/[spaceId]', `/${spaceId.toString()}`)
    .catch(err => log.error('Failed to redirect to "View Space" page:', err))
}

export function goToNewPostPage (space: HasSpaceIdOrHandle) {
  const { href, as } = createNewPostLinkProps(space)
  Router.push(href, as)
    .catch(err => log.error('Failed to redirect to "New Post" page:', err))
}