import { Option, StorageKey } from '@polkadot/types'
import { GenericAccountId } from '@polkadot/types/generic'
import { Space, WhoAndWhen } from '@subsocial/types/substrate/interfaces'
import dayjs, { Dayjs } from 'dayjs'
import { NextPageContext } from 'next'
import React from 'react'
import { accountUrl, postUrl, spaceUrl } from 'src/components/urls'
import { fullUrl } from 'src/components/urls/helpers'
import { seoOverwriteLastUpdate } from '../utils/env'
import { canHaveNextPostPage, canHaveNextSpacePage, getPageOfIds, getReversePageOfPostIds, getReversePageOfSpaceIds, parsePageQuery } from '../utils/getIds'
import { getSubsocialApi } from '../utils/SubsocialConnect'

/** See https://www.sitemaps.org/protocol.html#changefreqdef */
type ChangeFreq =
  'always' |
  'hourly' |
  'daily' |
  'weekly' |
  'monthly' |
  'yearly' |
  'never'

/** See https://www.sitemaps.org/protocol.html#urldef */
type UrlItem = {
  loc: string
  lastmod?: Dayjs
  changefreq?: ChangeFreq
  /** From 0.0 to 1.0 */
  priority?: number
}

/** See https://www.sitemaps.org/protocol.html#sitemapIndex_sitemap */
type SitemapItem = {
  loc: string
  lastmod?: string
}

type ResourceType = 'profiles' | 'spaces' | 'posts'

type HasCreatedOrUpdated = {
  created: WhoAndWhen;
  updated: Option<WhoAndWhen>;
}

const getLastModFromStruct = ({ updated, created }: HasCreatedOrUpdated) => {
  const lastUpdateFromStruct = dayjs(updated.unwrapOr(created).time.toNumber())
  return seoOverwriteLastUpdate && lastUpdateFromStruct.isBefore(seoOverwriteLastUpdate)
    ? seoOverwriteLastUpdate
    : lastUpdateFromStruct
}

/** See https://www.sitemaps.org/protocol.html#sitemapIndex_sitemap */
function renderSitemapItems (items: SitemapItem[]) {
  const defaultLastmod = todayLastmod()
  return items.map(({ loc, lastmod = defaultLastmod }) =>
    `<sitemap>
      <loc>${fullUrl(loc)}</loc>
      <lastmod>${lastmod}</lastmod>
    </sitemap>`
  ).join('')
}

/** See https://www.sitemaps.org/protocol.html#sitemapIndexXMLExample */
function renderSitemapIndex (items: SitemapItem[]) {
  return (
   `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${renderSitemapItems(items)}
    </sitemapindex>`
  )
}

function todayLastmod () {
  return dayjs().startOf('day').format('YYYY-MM-DD')
}

type PageLoc = {
  resource: ResourceType
  page: number
}

function pageLocOfSitemapIndex ({ page, resource }: PageLoc) {
  return `/sitemaps/${page}/${resource}-sitemapindex.xml`
}

function pageLocOfUrlSet ({ page, resource }: PageLoc) {
  return `/sitemaps/${page}/${resource}-urlset.xml`
}

type SitemapIndexPage = {
  resource: ResourceType
  page: number
  withNextPage?: boolean
}

function resourcePageToSitemapItems ({ resource, page, withNextPage }: SitemapIndexPage) {
  const lastmod = todayLastmod()
  const items: SitemapItem[] = [ { lastmod, loc: pageLocOfUrlSet({ resource, page }) } ]
  if (withNextPage) {
    const loc = pageLocOfSitemapIndex({ resource, page: page + 1 })
    items.push({ lastmod, loc })
  }
  return items
}

function renderSitemapIndexOfResource (input: SitemapIndexPage) {
  const items = resourcePageToSitemapItems(input)
  return renderSitemapIndex(items)
}

/** See https://www.sitemaps.org/protocol.html */
export function renderUrlSet (items: UrlItem[]) {
  return (
   `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${items.map(({ loc, lastmod, changefreq }) =>
       `<url>
          <loc>${fullUrl(loc)}</loc>
          ${lastmod
            ? `<lastmod>${lastmod.format('YYYY-MM-DD')}</lastmod>`
            : ''}
          ${changefreq
            ? `<changefreq>${changefreq}</changefreq>`
            : ''}
        </url>`
      ).join('')}
    </urlset>`
  )
}

function sendXml ({ res }: NextPageContext, xml: string) {
  if (res) {
    res.setHeader('Content-Type', 'text/xml')
    res.write(xml)
    res.end()
  }
}

const resources: ResourceType[] = [
  'profiles',
  'spaces',
  'posts'
]

export class MainSitemap extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const lastmod = todayLastmod()
    const firstPages: SitemapItem[] = resources.map(resource => (
      { lastmod, loc: pageLocOfSitemapIndex({ resource, page: 1 }) }
    ))
    sendXml(props, renderSitemapIndex(firstPages))
  }
}

export class SpacesSitemapIndex extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const query = parsePageQuery(props.query)
    const { page } = query
    const { substrate } = await getSubsocialApi()
    const nextSpaceId = await substrate.nextSpaceId()
    const withNextPage = canHaveNextSpacePage(nextSpaceId, query)
    const xml = renderSitemapIndexOfResource({ resource: 'spaces', page, withNextPage })
    sendXml(props, xml)
  }
}

export class PostsSitemapIndex extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const query = parsePageQuery(props.query)
    const { page } = query
    const subsocial = await getSubsocialApi()
    const nextPostId = await subsocial.substrate.nextPostId()
    const withNextPage = canHaveNextPostPage(nextPostId, query)
    const xml = renderSitemapIndexOfResource({ resource: 'posts', page, withNextPage })
    sendXml(props, xml)
  }
}

export class ProfilesSitemapIndex extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const { page, size } = parsePageQuery(props.query)
    const { substrate } = await getSubsocialApi()
    const profileKeys = await (await substrate.api).query.profiles.socialAccountById.keys()
    const withNextPage = page < Math.ceil(profileKeys.length / size)
    const xml = renderSitemapIndexOfResource({ resource: 'profiles', page, withNextPage })
    sendXml(props, xml)
  }
}

export class SpacesUrlSet extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const { query } = props
    const { substrate } = await getSubsocialApi()
    const nextSpaceId = await substrate.nextSpaceId()
    const ids = getReversePageOfSpaceIds(nextSpaceId, query)
    const spaces = await substrate.findSpaces({ ids, visibility: 'onlyPublic' })

    const items: UrlItem[] = spaces.map((space) => ({
      loc: spaceUrl(space),
      lastmod: getLastModFromStruct(space),
      changefreq: 'daily'
    }))
  
    sendXml(props, renderUrlSet(items))
  }
}

export class PostsUrlSet extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const { query } = props
    const subsocial = await getSubsocialApi()
    const nextPostId = await subsocial.substrate.nextPostId()
    const ids = getReversePageOfPostIds(nextPostId, query)
    const posts = await subsocial.findPublicPostsWithSomeDetails({ ids, withSpace: true })

    const items: UrlItem[] = posts.map(({ post, space }) => ({
      loc: postUrl(space?.struct || { id: post.struct.space_id.unwrap() } as Space, post), 
      lastmod: getLastModFromStruct(post.struct),
      changefreq: 'weekly'
    }))
    
    sendXml(props, renderUrlSet(items))
  }
}

export class ProfilesUrlSet extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const { query } = props
    const { substrate } = await getSubsocialApi()
    const profileKeys = await (await substrate.api).query.profiles.socialAccountById.keys()
    const pageKeys = getPageOfIds<StorageKey>(profileKeys, query)

    const ids: string[] = []
    pageKeys.forEach((key) => {
      if (key) {
        const addressEncoded = '0x' + key.toHex().substr(-64)
        ids.push(new GenericAccountId(key.registry, addressEncoded).toString())
      }
    })

    const items: UrlItem[] = []
    const socialAccounts = (await substrate.findSocialAccounts(ids))
    socialAccounts.forEach(({ profile: profileOpt }) => {
      if (profileOpt.isSome) {
        const profile = profileOpt.unwrap()
        items.push({ 
          loc: accountUrl({ address: profile.created.account }),
          lastmod: getLastModFromStruct(profile),
          changefreq: 'weekly'
        })
      }
    })

    sendXml(props, renderUrlSet(items))
  }
}
