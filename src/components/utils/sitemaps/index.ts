import { NextPageContext } from 'next'
import React from 'react'
import { getSubsocialApi } from '../SubsocialConnect'
import BN from 'bn.js'
import { isDef } from '@subsocial/utils'
import { accountUrl, postUrl, spaceUrl } from 'src/components/urls'
import { Space } from '@subsocial/types/substrate/interfaces'
import { GenericAccountId } from '@polkadot/types/generic'
import { getPageOfIds, getReversePageOfSpaceIds } from '../getIds'
import { DEFAULT_FIRST_PAGE } from 'src/config/ListData.config'

type SitemapProps = {
  props: NextPageContext,
  links: string[],
  withNextPage?: boolean
}

export const createSitemap = ({ props, links, withNextPage }: SitemapProps) => {
  const { query: { page = DEFAULT_FIRST_PAGE }, pathname, req } = props
  const host = req?.headers.host || ''

  const nextPageLink = () => {
    const nextPage = (page as string) + 1
    const sitemapType = pathname.split('/').pop()
    return withNextPage
      ? `<url>
        <loc>https://${host}/sitemaps/${nextPage}/${sitemapType}</loc>
      </url>`
      : ''
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${links
        .map((link) => {
          return `
                  <url>
                      <loc>https://${host}${link}</loc>
                  </url>
              `
        })
        .join('')}
        ${nextPageLink()}
  </urlset>
  `
}

const sendSiteMap = (props: SitemapProps) => {
  const { res, req } = props.props
  if (res && req ) {
    res.setHeader('Content-Type', 'text/xml')
    res.write(createSitemap(props))
    res.end()
  }
}

export class MainSitemap extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const links = [
      '/sitemaps/spaces.xml',
      '/sitemaps/posts.xml',
      '/sitemaps/profiles.xml'
    ]
    sendSiteMap({ props, links })
  }
}

export class SpacesSitemap extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const { query } = props
    const { substrate } = await getSubsocialApi()
    const nextSpaceId = await substrate.nextSpaceId()
    const spaceIds = await getReversePageOfSpaceIds(nextSpaceId, query)
    const spaces = await substrate.findSpaces({ ids: spaceIds, visibility: 'onlyPublic' })
    const links = spaces
      .map((space) => spaceUrl(space))
      .filter(isDef)
    
    sendSiteMap({ props, links, withNextPage: true })
  }
}

export class PostsSitemap extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const { query } = props
    const subsocial = await getSubsocialApi()
    const nextPostId = await subsocial.substrate.nextPostId()
    const allPostIds = new Array(nextPostId.subn(1).toNumber()).fill(0).map((_, i) => new BN(i + 1))
    const pageIds = getPageOfIds(allPostIds, query)
    const posts = await subsocial.findPublicPostsWithSomeDetails({ ids: pageIds, withSpace: true })

    const links = posts
      .map(({ post, space }) => postUrl(space?.struct || { id: post.struct.space_id.unwrap() } as Space, post))
      .filter(isDef)
    
    sendSiteMap({ props, links, withNextPage: true })
  }
}

export class ProfilesSitemap extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const { substrate: { api }} = await getSubsocialApi()
    const profilesEntry = await (await api).query.profiles.socialAccountById.keys()
    
    const links = profilesEntry.map((key) => {
      const addressEncoded = '0x' + key.toHex().substr(-64)
      return accountUrl({ address: new GenericAccountId(key.registry, addressEncoded).toString()})
    })
    sendSiteMap({ props, links })
  }
}