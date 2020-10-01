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

const socialLinksRegExp: Record<SocialBrand, RegExp[]> = {
  Facebook: [
    /(https?:\/\/)?(w{3}\.)?facebook\.com/iy,
    /(https?:\/\/)?(w{3}\.)?(facebook|fb)\.me/iy
  ],
  Twitter: [
    /(https?:\/\/)?(w{3}\.)?twitter\.com/iy
  ],
  Medium: [
    /(https?:\/\/)?(w{3}\.)?medium\.com/iy
  ],
  LinkedIn: [
    /(https?:\/\/)?(w{3}\.)?linkedin\.com\/in/iy
  ],
  GitHub: [
    /(https?:\/\/)?(w{3}\.)?github\.com/iy
  ],
  Instagram: [
    /(https?:\/\/)?(w{3}\.)?instagram\.com/iy
  ],
  Telegram: [
    /(https?:\/\/)?(w{3}\.)?telegram\.com/iy,
    /(https?:\/\/)?(w{3}\.)?(telegram|t)\.me/iy
  ]
}

const isSocialBrandLink = (brand: SocialBrand, link: string): boolean => {
  return !!socialLinksRegExp[brand].filter(x => x.test(link)).length
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
