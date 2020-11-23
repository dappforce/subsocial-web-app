import { SpaceContent, PostContent, NamedLink } from '@subsocial/types'
import { nonEmptyStr } from '@subsocial/utils'

export const getNonEmptySpaceContent = (content: SpaceContent): SpaceContent => {
  const { tags, links, ...rest } = content
  return {
    tags: getNonEmptyStrings(tags),
    links: getNonEmptyLinks(links) as [],
    ...rest
  }
}

export const getNonEmptyPostContent = (content: PostContent): PostContent => {
  const { tags, ...rest } = content
  return {
    tags: getNonEmptyStrings(tags),
    ...rest
  }
}

const getNonEmptyStrings = (inputArr: string[] = []): string[] => {
  const res: string[] = []
  inputArr.forEach(x => {
    if (nonEmptyStr(x)) {
      res.push(x.trim())
    }
  })
  return res
}

type Link = string | NamedLink

const getNonEmptyLinks = (inputArr: Link[] = []): Link[] => {
  const res: Link[] = []
  inputArr.forEach(x => {
    if (nonEmptyStr(x)) {
      res.push(x.trim())
    } else if (typeof x === 'object' && nonEmptyStr(x.url)) {
      const { name } = x
      res.push({
        name: nonEmptyStr(name) ? name.trim() : name,
        url: x.url.trim()
      })
    }
  })
  return res
}
