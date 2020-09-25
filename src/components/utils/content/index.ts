import { SpaceContent, PostContent } from "@subsocial/types"
import { nonEmptyStr } from "@subsocial/utils"

export const resolveContent = <T extends SpaceContent | PostContent>(content: T): T => {
  const { tags, ...otherContent } = content

  return { tags: resolveTags(tags), ...otherContent } as T
}

export const resolveTags = (tags: string[]) => tags.filter(nonEmptyStr).map(x => x.trim())
