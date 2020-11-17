import React from 'react'
import { NamedLink } from '@subsocial/types'
import { getLinkBrand, getLinkIcon } from './utils'
import { MailOutlined } from '@ant-design/icons'
import { isEmptyStr } from '@subsocial/utils'
import { BareProps } from 'src/components/utils/types'

type SocialLinkProps = BareProps & {
  link: string,
  label?: string
}

export const SocialLink = ({ link, label, className }: SocialLinkProps) => {
  if (isEmptyStr(link)) return null

  const brand = getLinkBrand(link)
  return <a href={link} title={brand} rel="noreferrer" target='_blank' className={`DfBlackLink ${className}`}>
    {getLinkIcon(brand)}
    {label && <>
      <span className='ml-2'>{label}</span>
      <span className='ml-1'>{brand}</span>
    </>}
  </a>
}

type SocialLinksProps = {
  links: string[] | NamedLink[]
}

export const ViewSocialLinks = ({ links }: SocialLinksProps) => {
  return <>{(links as string[]).map((link, i) =>
    <SocialLink key={`social-link-${i}`} link={link} className='ml-3' />
  )}</>
}

type ContactInfoProps = SocialLinksProps & {
  email: string
}

type EmailLink = BareProps & {
  link: string,
  label?: string
}

export const EmailLink = ({ link, label, className }: EmailLink) => 
  <a className={`DfBlackLink ${className}`} href={`maito:${link}`} title='Email'>
    <MailOutlined />
    {label && <span className='ml-2'>{`${label} email`}</span>}
  </a>

export const ContactInfo = ({ links, email }: ContactInfoProps) => {
  if (!links && !email) return null

  return <div>
    {links && <ViewSocialLinks links={links} />}
    {email && <EmailLink className={links && 'mr-3'} link={email} />}
  </div>
}
