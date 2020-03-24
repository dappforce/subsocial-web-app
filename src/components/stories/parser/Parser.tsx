import React, { useEffect } from 'react'
// import parseSite from './parse-site'
import parseVideo from './parse-video'

const Parser = () => {
  // const siteUrl = ''
  const videoUrl = 'https://www.youtube.com/watch?v=PkuDAwjMWiE'

  useEffect(() => {
    const parser = async () => {
      const parsedSite = await parseVideo([ videoUrl ])
      console.log('parsedSite', parsedSite)
    }

    parser()
  }, [ videoUrl ])

  return <div>
    <div>Parser Component</div>
  </div>
}

export default Parser
