import { seoOverwriteLastUpdate } from './../env';
import { NextPageContext } from 'next'
import React from 'react'
import { getSubsocialApi } from '../SubsocialConnect'
import BN from 'bn.js'
import { isDef } from '@subsocial/utils'
import { accountUrl, postUrl, spaceUrl } from 'src/components/urls'
import { SocialAccount, Space, WhoAndWhen } from '@subsocial/types/substrate/interfaces'
import { GenericAccountId } from '@polkadot/types/generic'
import { getPageOfIds, getReversePageOfSpaceIds } from '../getIds'
import { DEFAULT_FIRST_PAGE } from 'src/config/ListData.config'
import { fullPath } from 'src/components/urls/helpers'
import { Option, StorageKey } from '@polkadot/types' 

type Item = {
  link: string,
  lastMod?: Date
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

const getLastModeFromStruct = ({ updated, created }: HasCreatedOrUpdated) => {
  const lastUpdateFromStruct = new Date(updated.unwrapOr(created).time.toNumber())
  return seoOverwriteLastUpdate &&
    lastUpdateFromStruct < seoOverwriteLastUpdate
      ? seoOverwriteLastUpdate
      : lastUpdateFromStruct
}

export const createSitemap = ({ props, items, withNextPage }: SitemapProps) => {
  const { query: { page = DEFAULT_FIRST_PAGE }, pathname } = props

  const nextPageLink = () => {
    const nextPage = (page as string) + 1
    const sitemapType = pathname.split('/').pop()
    return withNextPage
      ? `<url>
        <loc>${fullPath(`/sitemaps/${nextPage}/${sitemapType}`)}</loc>
      </url>`
      : ''
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${items
        .map(({ link, lastMod }) => {
          return `
                  <url>
                      <loc>${fullPath(link)}</loc>
                      ${lastMod
                        ? `<lastmod>${lastMod.toISOString()}</lastmod>`
                        : ''}
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
    const items: Item []= [
      '/sitemaps/spaces.xml',
      '/sitemaps/posts.xml',
      '/sitemaps/profiles.xml'
    ].map(link => ({ link }))
  
    sendSiteMap({ props, items })
  }
}

export class SpacesSitemap extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const { query } = props
    const { substrate } = await getSubsocialApi()
    const nextSpaceId = await substrate.nextSpaceId()
    const spaceIds = await getReversePageOfSpaceIds(nextSpaceId, query)
    const spaces = await substrate.findSpaces({ ids: spaceIds, visibility: 'onlyPublic' })
    const items: Item[] = spaces
      .map((space) => ({
          link: spaceUrl(space),
          lastMod: getLastModeFromStruct(space) 
        }))
  
    sendSiteMap({ props, items, withNextPage: true })
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

    const items: Item[] = posts
      .map(({ post, space }) => ({
        link: postUrl(space?.struct || { id: post.struct.space_id.unwrap() } as Space, post), 
        lastMod: getLastModeFromStruct(post.struct)
      }))
    
    sendSiteMap({ props, items, withNextPage: true })
  }
}

export class ProfilesSitemap extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const { substrate } = await getSubsocialApi()
    const profilesEntry = await (await substrate.api).query.profiles.socialAccountById.keys()
    
    const ids = profilesEntry.map((key) => {
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
            lastMod: getLastModeFromStruct(profile)
          }
        }

        return undefined
      })
      .filter(isDef)

    sendSiteMap({ props, items })
  }
}