import React from 'react'
import { Icon } from 'antd'

type Network = 'facebook' | 'twitter' | 'linkedin'

type Props = {
  network: Network
  text?: string
}

const ShareButton = (props: Props) => {
  const { network, text = '' } = props
  const url = window.location

  let link, icon, name

  if (network === 'facebook') {
    link = `https://www.facebook.com/sharer/sharer.php?u=${url}`
    icon = 'facebook'
  } else if (network === 'twitter') {
    link = `https://twitter.com/share?text=${text}&url=${url}`
    icon = 'twitter'
  } else if (network === 'linkedin') {
    link = `https://www.linkedin.com/shareArticle?url=${url}&title=${text}`
    icon = 'linkedin'
  }

  return <a target='_blank' href={link}>
    <Icon type={icon} />
  </a>
}

export default ShareButton