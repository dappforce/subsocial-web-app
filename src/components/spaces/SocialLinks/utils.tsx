import {
  FacebookOutlined,
  TwitterOutlined,
  MediumOutlined,
  LinkedinOutlined,
  GithubOutlined,
  InstagramOutlined,
  GlobalOutlined
} from '@ant-design/icons'

export const getLinksAttr = (title?: string) => {
  switch (title) {
    case 'Facebook': return { title, icon: <FacebookOutlined /> }
    case 'Twitter': return { title, icon: <TwitterOutlined /> }
    case 'Medium': return { title, icon: <MediumOutlined /> }
    case 'LinkedIn': return { title, icon: <LinkedinOutlined /> }
    case 'GitHub': return { title, icon: <GithubOutlined /> }
    case 'Instagram': return { title, icon: <InstagramOutlined /> }
    default: return { title, icon: <GlobalOutlined /> }
  }
}

export const socialLinksRegExp: Record<string, RegExp> = {
  Facebook: /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)/i,
  Twitter: /(?:https?:\/\/)?(?:www\.)?(?:twitter)\.(?:com)/i,
  Medium: /(?:https?:\/\/)?(?:www\.)?(?:medium)\.(?:com)/i,
  LinkedIn: /(?:https?:\/\/)?(?:www\.)?(?:linkedin)\.(?:com)/i,
  Github: /(?:https?:\/\/)?(?:www\.)?(?:github)\.(?:com)/i,
  Instagram: /(?:https?:\/\/)?(?:www\.)?(?:instagram)\.(?:com)/i,
  Telegram: /(?:https?:\/\/)?(?:www\.)?(?:telegram|t|)\.(?:com|me)/i
}

export const getSocialLinkType = (link: string) => {
  for (const key in socialLinksRegExp) {
    if (socialLinksRegExp[key].test(link)) return key
  }

  return undefined
}
