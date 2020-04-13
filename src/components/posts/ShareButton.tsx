import React from 'react'
import { Icon } from 'antd'

type Network = 'facebook' | 'twitter' | 'linkedin'

type Props = {
  network: Network
  path: string
  text?: string
}

const ShareButton = (props: Props) => {
  const { network, path, text = '' } = props
  const HOSTNAME = 'http://testnet.subsocial.network/'
  const url = `${HOSTNAME}${path}`

  const makeLink = () => {
    switch (network) {
      case 'facebook': {
        const link = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        return <a
          target='_blank'
          href={link}
        >
          <Icon type="facebook" />
          Facebook
        </a>
      }
      case 'twitter': {
        const link = `https://twitter.com/share?text=${text}&url=${url}`
        return <a
          target='_blank'
          href={link}
        >
          <Icon type="twitter" />
          Twitter
        </a>
      }
      case 'linkedin': {
        const link = `https://www.linkedin.com/shareArticle?url=${url}&title=${text}`
        return <a
          target='_blank'
          href={link}
        >
          <Icon type="linkedin" />
          LinkedIn
        </a>
      }
      default: {
        return null
      }
    }
  }

  return makeLink()
}

export default ShareButton