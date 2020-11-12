import React from 'react'

const EXTERNAL_DATA_URL = 'https://jsonplaceholder.typicode.com/posts'

const createSitemap = (posts: any[]) => `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${posts
          .map(({ id }) => {
            return `
                    <url>
                        <loc>${`${EXTERNAL_DATA_URL}/${id}`}</loc>
                    </url>
                `
          })
          .join('')}
    </urlset>
    `

class Sitemap extends React.Component {
  static async getInitialProps ({ res }: any) {
    const request = await fetch(EXTERNAL_DATA_URL)
    const posts = await request.json()

    res.setHeader('Content-Type', 'text/xml')
    res.write(createSitemap(posts))
    res.end()
  }
}

export default Sitemap