import React from 'react'
import { Icon } from 'antd'

type Props = {
  link: string
}

const RegExps = [
  { name: 'twitter', regexp: /http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/ },
  { name: 'facebook', regexp: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/.(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]*)/ },
  { name: 'github', regexp: /https:\/\/github.intuit.com\/[^\/]+\/[^\/]+/ },
  { name: 'instagram', regexp: /(?:(?:http|https):\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/([A-Za-z0-9-_\.]+)/im }
]

const SocialLink = (props: Props) => {
  const { link } = props

  let icon = ''
  RegExps.map((x) => {
    if (link.match(x.regexp)) icon = x.name
  })

  return  <a target='_blank' href={link}>
    <Icon type={icon} />
  </a>
}

export default SocialLink