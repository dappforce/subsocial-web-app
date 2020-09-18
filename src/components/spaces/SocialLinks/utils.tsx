import {
  FacebookOutlined,
  TwitterOutlined,
  MediumOutlined,
  LinkedinOutlined,
  GithubOutlined,
  InstagramOutlined,
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
  'Telegram'

export type LinkLabel = SocialBrand | 'Website'

const brandsWithProfiles: SocialBrand[] = [
  'Facebook',
  'Twitter',
  'Medium',
  'LinkedIn',
  'GitHub',
  'Instagram'
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
    case 'Telegram': return <SendOutlined />
    case 'Website': return <GlobalOutlined />
    default: return <GlobalOutlined />
  }
}

const socialLinksRegExp: Record<SocialBrand, RegExp> = {
  Facebook: /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)/i,
  Twitter: /(?:https?:\/\/)?(?:www\.)?(?:twitter)\.(?:com)/i,
  Medium: /(?:https?:\/\/)?(?:www\.)?(?:medium)\.(?:com)/i,
  LinkedIn: /(?:https?:\/\/)?(?:www\.)?(?:linkedin)\.(?:com)/i,
  GitHub: /(?:https?:\/\/)?(?:www\.)?(?:github)\.(?:com)/i,
  Instagram: /(?:https?:\/\/)?(?:www\.)?(?:instagram)\.(?:com)/i,
  Telegram: /(?:https?:\/\/)?(?:www\.)?(?:telegram|t|)\.(?:com|me)/i
}

const isSocialBrandLink = (brand: SocialBrand, link: string): boolean => {
  return socialLinksRegExp[brand].test(link)
}

export const getLinkBrand = (link: string): SocialBrand | undefined => {
  for (const key in socialLinksRegExp) {
    const brand = key as SocialBrand
    if (isSocialBrandLink(brand, link)) {
      return brand
    }
  }
  return undefined
}
