import { isEmptyStr } from '@subsocial/utils'
import {
  FacebookOutlined,
  TwitterOutlined,
  MediumOutlined,
  LinkedinOutlined,
  GithubOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  SendOutlined,
  GlobalOutlined
} from '@ant-design/icons'

type SocialBrand =
  'Facebook' |
  'Twitter' |
  'Medium' |
  'LinkedIn' |
  'GitHub' |
  'Instagram' |
  'YouTube' |
  'Telegram'

export type LinkLabel = SocialBrand | 'Website'

const brandsWithProfiles: SocialBrand[] = [
  'Facebook',
  'Twitter',
  'Medium',
  'LinkedIn',
  'GitHub',
  'Instagram',
  'YouTube'
]

export const hasSocialMediaProfiles = (brand: LinkLabel): boolean => {
  return brandsWithProfiles.indexOf(brand as SocialBrand) >= 0
}

export const getLinkIcon = (brand?: LinkLabel) => {
  switch (brand) {
    case 'Facebook': return <FacebookOutlined />
    case 'Twitter': return <TwitterOutlined />
    case 'Medium': return <MediumOutlined />
    case 'LinkedIn': return <LinkedinOutlined />
    case 'GitHub': return <GithubOutlined />
    case 'Instagram': return <InstagramOutlined />
    case 'YouTube': return <YoutubeOutlined />
    case 'Telegram': return <SendOutlined />
    case 'Website': return <GlobalOutlined />
    default: return <GlobalOutlined />
  }
}

const linkPrefix = '^(https?:\/\/)?([a-z0-9-]+\.)?'

const newSocialLinkRegExp = (brandDomain: string): RegExp => {
  return new RegExp(linkPrefix + brandDomain)
}

const socialLinksRegExp: Record<SocialBrand, RegExp[]> = {
  Facebook: [
    newSocialLinkRegExp('facebook.com'),
    newSocialLinkRegExp('fb.me'),
    newSocialLinkRegExp('fb.com'),
    newSocialLinkRegExp('facebook.me')
  ],
  Twitter: [
    newSocialLinkRegExp('twitter.com')
  ],
  Medium: [
    newSocialLinkRegExp('medium.com')
  ],
  LinkedIn: [
    newSocialLinkRegExp('linkedin.com'),
    newSocialLinkRegExp('linked.in')
  ],
  GitHub: [
    newSocialLinkRegExp('github.com')
  ],
  Instagram: [
    newSocialLinkRegExp('instagram.com'),
    newSocialLinkRegExp('instagr.am')
  ],
  YouTube: [
    newSocialLinkRegExp('youtube.com'),
    newSocialLinkRegExp('youtu.be')
  ],
  Telegram: [
    newSocialLinkRegExp('t.me'),
    newSocialLinkRegExp('telegram.me')
  ]
}

const isSocialBrandLink = (brand: SocialBrand, link: string): boolean => {
  if (isEmptyStr(link)) {
    return false
  }

  link = link.trim().toLowerCase()
  return !!socialLinksRegExp[brand].find(r => r.test(link))
}

export const getLinkBrand = (link: string): LinkLabel | undefined => {
  for (const key in socialLinksRegExp) {
    const brand = key as SocialBrand
    if (isSocialBrandLink(brand, link)) {
      return brand
    }
  }
  return 'Website'
}
