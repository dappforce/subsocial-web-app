import { Option, StorageKey } from '@polkadot/types'
import { GenericAccountId } from '@polkadot/types/generic'
import { Space, WhoAndWhen } from '@subsocial/types/substrate/interfaces'
import dayjs, { Dayjs } from 'dayjs'
import { NextPageContext } from 'next'
import React from 'react'
import { accountUrl, postUrl, spaceUrl } from 'src/components/urls'
import { fullUrl } from 'src/components/urls/helpers'
import { seoSitemapLastmod, seoSitemapPageSize } from '../utils/env'
import { getSubsocialApi } from '../utils/SubsocialConnect'
import {
  approxCountOfPostPages,
  approxCountOfSpacePages,
  getPageOfIds,
  getReversePageOfPostIds,
  getReversePageOfSpaceIds,
  ParsedPaginationQuery,
  parsePageQuery
} from '../utils/getIds'

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

type ResourceType = 'profiles' | 'spaces' | 'posts'

type HasCreatedOrUpdated = {
  created: WhoAndWhen
  updated: Option<WhoAndWhen>
}

const getLastModFromStruct = ({ updated, created }: HasCreatedOrUpdated) => {
  const lastUpdateFromStruct = dayjs(updated.unwrapOr(created).time.toNumber())
  return seoSitemapLastmod && lastUpdateFromStruct.isBefore(seoSitemapLastmod)
    ? seoSitemapLastmod
    : lastUpdateFromStruct
}
  
function todayLastmod () {
  return dayjs().startOf('day').format('YYYY-MM-DD')
}

type ResourceSitemapIndex = {
  resource: ResourceType
  totalPages: number
}
  
/**
 * Sitemap file must have no more than 50,000 URLs and must be no larger than 50 MB.
 * 
 * See https://www.sitemaps.org/protocol.html#sitemapIndexXMLExample
 */
function renderSitemapIndexOfResource ({ resource, totalPages }: ResourceSitemapIndex) {
  const lastmod = todayLastmod()
  const items: string[] = []

  for (let page = 1; page <= totalPages; page++) {
    const loc = `/sitemap/${resource}/urlset.xml?page=${page}`
    items.push(`
      <sitemap>
        <loc>${fullUrl(loc)}</loc>
        <lastmod>${lastmod}</lastmod>
      </sitemap>`
    )
  }

  return (
    `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${items.join('\n')}
    </sitemapindex>`
  )
}

/**
 * Sitemap index files may not list more than 50,000 sitemaps
 * and must be no larger than 50 MB.
 * 
 * See https://www.sitemaps.org/protocol.html
 */
function renderUrlSet (items: UrlItem[]) {
  return (
   `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${items.map(({ loc, lastmod, changefreq }) => `
        <url>
          <loc>${fullUrl(loc)}</loc>
          ${lastmod
            ? `<lastmod>${lastmod.format('YYYY-MM-DD')}</lastmod>`
            : ''}
          ${changefreq
            ? `<changefreq>${changefreq}</changefreq>`
            : ''}
        </url>`
      ).join('\n')}
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

const getPageAndSize = (props: NextPageContext): ParsedPaginationQuery => {
  const { page } = parsePageQuery(props.query)
  return { page, size: seoSitemapPageSize }
}

export class SpacesSitemapIndex extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const query = getPageAndSize(props)
    const { substrate } = await getSubsocialApi()
    const nextSpaceId = await substrate.nextSpaceId()
    const totalPages = approxCountOfSpacePages(nextSpaceId, query)
    const xml = renderSitemapIndexOfResource({ resource: 'spaces', totalPages })
    sendXml(props, xml)
  }
}

export class PostsSitemapIndex extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const query = getPageAndSize(props)
    const subsocial = await getSubsocialApi()
    const nextPostId = await subsocial.substrate.nextPostId()
    const totalPages = approxCountOfPostPages(nextPostId, query)
    const xml = renderSitemapIndexOfResource({ resource: 'posts', totalPages })
    sendXml(props, xml)
  }
}

export class ProfilesSitemapIndex extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const { size } = getPageAndSize(props)
    const { substrate } = await getSubsocialApi()
    const profileKeys = await (await substrate.api).query.profiles.socialAccountById.keys()
    const totalPages = Math.ceil(profileKeys.length / size)
    const xml = renderSitemapIndexOfResource({ resource: 'profiles', totalPages })
    sendXml(props, xml)
  }
}

export class SpacesUrlSet extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const query = getPageAndSize(props)
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
    const query = getPageAndSize(props)
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
    const query = getPageAndSize(props)
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
