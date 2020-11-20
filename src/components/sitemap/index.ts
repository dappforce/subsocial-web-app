import { NextPageContext } from 'next'
import React from 'react'
import { isDef } from '@subsocial/utils'
import { accountUrl, postUrl, spaceUrl } from 'src/components/urls'
import { Space, WhoAndWhen } from '@subsocial/types/substrate/interfaces'
import { GenericAccountId } from '@polkadot/types/generic'
import { DEFAULT_FIRST_PAGE } from 'src/config/ListData.config'
import { fullUrl } from 'src/components/urls/helpers'
import { Option, StorageKey } from '@polkadot/types' 
import { seoOverwriteLastUpdate } from '../utils/env'
import { getPageOfIds, getPageOfIdsWithRespectToNextId } from '../utils/getIds'
import { getSubsocialApi } from '../utils/SubsocialConnect'
import dayjs, { Dayjs } from 'dayjs'
import { tryParseInt } from 'src/utils'

type Item = {
  link: string,
  lastmod?: Dayjs,
  changefreq?: 'daily'
}

type SitemapProps = {
  props: NextPageContext,
  items: Item[],
  withNextPage?: boolean
}

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

export const createSitemap = ({ props, items, withNextPage }: SitemapProps) => {
  const { query: { page }, pathname } = props

  const nextPageLink = () => {
    const pageNumber = tryParseInt((page as string), DEFAULT_FIRST_PAGE) 
    const nextPage = pageNumber + 1
    const sitemapType = pathname.split('/').pop()

    return withNextPage
      ? `<sitemap>
        <loc>${fullUrl(`/sitemaps/${nextPage}/${sitemapType}`)}</loc>
        <changefreq>daily</changefreq>
      </sitemap>`
      : ''
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${items
      .map(({ link, lastmod, changefreq }) => {
        const itemTag = link.includes('/sitemaps/') ? 'sitemap' : 'url'
        return `
          <${itemTag}>
            <loc>${fullUrl(link)}</loc>
            ${lastmod
              ? `<lastmod>${lastmod.format('YYYY-MM-DD')}</lastmod>`
              : ''}
            ${changefreq
              ? `<changefreq>${changefreq}</changefreq>`
              : ''}
          </${itemTag}>`
      })
      .join('')
    }
    ${nextPageLink()}
  </urlset>`
}

const sendSiteMap = (props: SitemapProps) => {
  const { req, res } = props.props
  if (req && res) {
    if (!props.items.length) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'text/plain')
      res.write('Not Found (404)')
      res.end()
    } else {
      res.setHeader('Content-Type', 'text/xml')
      res.write(createSitemap(props))
      res.end()
    }
  }
  return void(0)
}

const linksUpdatedDaily = [
  '/',
  '/spaces',
  '/sitemaps/1/spaces.xml',
  '/sitemaps/1/posts.xml',
  '/sitemaps/1/profiles.xml'
]

export class MainSitemap extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const lastmod = dayjs().startOf('day')

    const items: Item [] = linksUpdatedDaily.map(link => ({
      link,
      lastmod,
      changefreq: 'daily'
    }))

    items.push({ link: '/faucet' })
  
    sendSiteMap({ props, items })
  }
}

export class SpacesSitemap extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const { query } = props
    const { substrate } = await getSubsocialApi()
    const nextSpaceId = await substrate.nextSpaceId()
    const spaceIds = getPageOfIdsWithRespectToNextId(nextSpaceId, query)
    const spaces = await substrate.findSpaces({ ids: spaceIds, visibility: 'onlyPublic' })

    const items: Item[] = spaces
      .map((space) => ({
        link: spaceUrl(space),
        lastmod: getLastModFromStruct(space) 
      }))
  
    sendSiteMap({ props, items, withNextPage: true })
  }
}

export class PostsSitemap extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const { query } = props
    const subsocial = await getSubsocialApi()
    const nextPostId = await subsocial.substrate.nextPostId()
    const postIds = getPageOfIdsWithRespectToNextId(nextPostId, query)
    const posts = await subsocial.findPublicPostsWithSomeDetails({ ids: postIds, withSpace: true })

    const items: Item[] = posts
      .map(({ post, space }) => ({
        link: postUrl(space?.struct || { id: post.struct.space_id.unwrap() } as Space, post), 
        lastmod: getLastModFromStruct(post.struct)
      }))
    
    sendSiteMap({ props, items, withNextPage: true })
  }
}

export class ProfilesSitemap extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const { query } = props
    const { substrate } = await getSubsocialApi()
    const profileKeys = await (await substrate.api).query.profiles.socialAccountById.keys()
    const pageKeys = getPageOfIds<StorageKey>(profileKeys, query)

    const ids = pageKeys.map((key) => {
      const addressEncoded = '0x' + key.toHex().substr(-64)
      return new GenericAccountId(key.registry, addressEncoded).toString()
    })

    const socialAccounts = await substrate.findSocialAccounts(ids)

    const items = socialAccounts
      .map(({ profile: profileOpt }) => {
        if (profileOpt.isSome) {
          const profile = profileOpt.unwrap()

          return { 
            link: accountUrl({ address: profile.created.account }),
            lastmod: getLastModFromStruct(profile)
          }
        }

        return undefined
      })
      .filter(isDef)

    sendSiteMap({ props, items, withNextPage: true })
  }
}
