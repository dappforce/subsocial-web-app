import { NextPageContext } from 'next';
import React from 'react'
import { getSubsocialApi } from '../SubsocialConnect';
import BN from 'bn.js'
import { slugify } from 'src/components/urls/helpers';
import { isDef } from '@subsocial/utils';

export const createSitemap = (links: string[], pathname: string) => `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${links
          .map((link) => {
            return `
                    <url>
                        <loc>${pathname}/${link}</loc>
                    </url>
                `
          })
          .join('')}
    </urlset>
    `

const sendSiteMap = ({ res, pathname }: NextPageContext, links: string[]) => {
  if (res) {
    res.setHeader('Content-Type', 'text/xml')
    res.write(createSitemap(links, pathname))
    res.end()
  }
}

export class MainSitemap extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const links = [
      'spaces-map.xml',
      'posts-map.xml',
      'profiles-map.xml'
    ]
    sendSiteMap(props, links)
  }
}

export class SpacesSitemap extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    console.log(props)
    const { substrate } = await getSubsocialApi()
    const nextSpaceId = await substrate.nextSpaceId()
    const spaceIds = new Array(nextSpaceId.subn(1).toNumber()).fill(0).map(x => new BN(x + 1))
    const spaces = await substrate.findSpaces({ ids: spaceIds, visibility: 'onlyVisible' })
    const handles = spaces
      .map(({ handle }) => slugify(handle))
      .filter(isDef)
    
    sendSiteMap(props, handles)
  }
}

export class PostsSitemap extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const links = [
      'spaces-map.xml',
      'posts-map.xml',
      'profiles-map.xml'
    ]
    sendSiteMap(props, links)
  }
}

export class ProfilesSitemap extends React.Component {
  static async getInitialProps (props: NextPageContext) {
    const links = [
      'spaces-map.xml',
      'posts-map.xml',
      'profiles-map.xml'
    ]
    sendSiteMap(props, links)
  }
}