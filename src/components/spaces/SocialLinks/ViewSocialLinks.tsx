import React from 'react'
import { NamedLink } from '@subsocial/types'
import { getLinkBrand, getLinkIcon } from './utils'
import { MailOutlined } from '@ant-design/icons'
import { isEmptyStr } from '@subsocial/utils'

type SocialLinkProps = {
  link: string,
  withTitle?: boolean
}

export const SocialLink = ({ link, withTitle }: SocialLinkProps) => {
  if (isEmptyStr(link)) return null

  const brand = getLinkBrand(link)
  return <a href={link} title={brand} rel="noreferrer" target='_blank' className='DfBlackLink ml-3'>
    {getLinkIcon(brand)}
    {withTitle && brand}
  </a>
}

type SocialLinksProps = {
  links: string[] | NamedLink[]
}

export const ViewSocialLinks = ({ links }: SocialLinksProps) => {
  return <>{(links as string[]).map((link, i) =>
    <SocialLink key={`social-link-${i}`} link={link} />
  )}</>
}

type ContactInfoProps = SocialLinksProps & {
  email: string
}

export const ContactInfo = ({ links, email }: ContactInfoProps) => {
  if (!links && !email) return null

  return <div>
    {links && <ViewSocialLinks links={links} />}
    {email && <a className={`DfBlackLink ${links && 'ml-3'}`} href={`maito:${email}`} title='Email'><MailOutlined /></a>}
  </div>
}
