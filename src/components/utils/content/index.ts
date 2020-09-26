import { SpaceContent, PostContent } from "@subsocial/types"
import { nonEmptyStr } from "@subsocial/utils"

type Content = SpaceContent | PostContent

export const resolveContent = <T extends Content>(content: T): T => {
  const { tags, ...otherContent } = content

  return { tags: resolveTags(tags), ...otherContent } as T
}

export const resolveTags = (tags: string[] = []) =>
  tags
    .filter(nonEmptyStr)
    .map(x => x.trim())
