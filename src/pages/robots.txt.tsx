import { NextPageContext } from 'next'
import React from 'react'
import { appBaseUrl } from 'src/components/utils/env'

const createRobotsTxt = () => `
  User-agent: *
  Disallow: /_next/static/
  Disallow: /*/edit
  Disallow: /*/new
  Disallow: /sudo
  Disallow: /feed
  Disallow: /notifications
  Disallow: /search

  Allow: /faucet

  Sitemap: ${appBaseUrl}/sitemap.xml
`

class Robots extends React.Component {
  public static async getInitialProps ({ res }: NextPageContext) {
    if (res) {
      res.setHeader('Content-Type', 'text/plain')
      res.write(createRobotsTxt())
      res.end()
    }
  }
}

export default Robots
