import React from 'react'
import { Icon } from 'antd'

type Props = {
  link: string
  className?: string
}

const RegExps = [
  { name: 'twitter', regexp: /http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/ },
  { name: 'facebook', regexp: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/.(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]*)/ },
  { name: 'github', regexp: /https:\/\/github.intuit.com\/[^\/]+\/[^\/]+/ },
  { name: 'instagram', regexp: /(?:(?:http|https):\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/([A-Za-z0-9-_\.]+)/im }
]

const SocialLink = (props: Props) => {
  const { link, className } = props

  const icon = RegExps.find((x) => link.match(x.regexp))?.name

  return  <a target='_blank' className={className} href={link}>
    <Icon type={icon} />
  </a>
}

export default SocialLink