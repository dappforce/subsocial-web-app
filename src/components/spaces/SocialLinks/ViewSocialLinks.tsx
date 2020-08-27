import React from 'react'
import { NamedLinks } from '@subsocial/types'
import { getSocialLinkType, getLinksAttr } from './utils'
import { MailOutlined } from '@ant-design/icons'

type SocialLinkProps = {
  link: string
}

const attrByLink = (link: string) => {
  const title = getSocialLinkType(link)

  return getLinksAttr(title)
}

const SocialLink = ({ link }: SocialLinkProps) => {
  const { title, icon } = attrByLink(link)
  return <a href={link} title={title} className='DfBlackLink mr-3'>
    {icon}
  </a>
}

type SocialLinksProps = {
  links: string[] | NamedLinks[]
}

export const ViewSocialLinks = ({ links }: SocialLinksProps) => {
  return <>{(links as string[]).map(link => <SocialLink key={link} link={link} />)}</>
}

type ContactInfoProps = SocialLinksProps & {
  email: string
}

export const ContactInfo = ({ links, email }: ContactInfoProps) => {
  if (!links && !email) return null

  return <div>
    {links && <ViewSocialLinks links={links} />}
    {email && <a href={`maito:${email}`} title='Email'><MailOutlined /></a>}
  </div>
}
