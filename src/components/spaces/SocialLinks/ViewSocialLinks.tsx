import React from 'react'
import {
  FacebookOutlined,
  TwitterOutlined,
  MediumOutlined,
  LinkedinOutlined,
  GithubOutlined,
  InstagramOutlined,
  GlobalOutlined,
  MailOutlined
} from '@ant-design/icons'
import { NamedLinks } from '@subsocial/types'

const socialLinksRegExp: Record<string, RegExp> = {
  Facebook: /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)/i,
  Twitter: /(?:https?:\/\/)?(?:www\.)?(?:twitter)\.(?:com)/i,
  Medium: /(?:https?:\/\/)?(?:www\.)?(?:medium)\.(?:com)/i,
  LinkedIn: /(?:https?:\/\/)?(?:www\.)?(?:linkedin)\.(?:com)/i,
  Github: /(?:https?:\/\/)?(?:www\.)?(?:github)\.(?:com)/i,
  Instagram: /(?:https?:\/\/)?(?:www\.)?(?:instagram)\.(?:com)/i,
  Telegram: /(?:https?:\/\/)?(?:www\.)?(?:telegram|t|)\.(?:com|me)/i
}

const getSocialLinkType = (link: string) => {
  for (const key in socialLinksRegExp) {
    if (socialLinksRegExp[key].test(link)) return key
  }

  return undefined
}

type SocialLinkProps = {
  link: string
}

const getLinksAttr = (link: string) => {
  const title = getSocialLinkType(link)

  switch (title) {
    case 'Facebook': return { title, icon: <FacebookOutlined /> }
    case 'Twitter': return { title, icon: <TwitterOutlined /> }
    case 'Medium': return { title, icon: <MediumOutlined /> }
    case 'LinkedIn': return { title, icon: <LinkedinOutlined /> }
    case 'Github': return { title, icon: <GithubOutlined /> }
    case 'Instagram': return { title, icon: <InstagramOutlined /> }
    default: return { title, icon: <GlobalOutlined /> }
  }
}

const SocialLink = ({ link }: SocialLinkProps) => {
  const { title, icon } = getLinksAttr(link)
  return <a href={link} title={title} className='DfBlackLink mr-3'>
    {icon}
  </a>
}

type SocialLinksProps = {
  links: string[] | NamedLinks[]
}

export const ViewSocialLinks = ({ links }: SocialLinksProps) => {
  return <>{(links as string[]).map(link => <SocialLink link={link} />)}</>
}

type ContactInfoProps = SocialLinksProps & {
  email: string
}

export const ContactInfo = ({ links, email }: ContactInfoProps) => {
  console.log(links)
  if (!links && !email) return null

  return <div>
    {links && <ViewSocialLinks links={links} />}
    {email && <a href={`maito:${email}`} title='Email'><MailOutlined /></a>}
  </div>
}
