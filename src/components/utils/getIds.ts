import BN from 'bn.js'
import { ONE } from '.'
import { claimedSpaceIds, lastReservedSpaceId } from './env'
import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_SIZE } from 'src/config/ListData.config'
import { nonEmptyStr } from '@subsocial/utils'
import { tryParseInt } from 'src/utils'

export const getLastNIds = (nextId: BN, size: number): BN[] => {
  let minId = nextId.subn(size)
  if (minId.lt(ONE)) {
    minId = ONE
  }

  const ids: BN[] = []
  for (let id = nextId.sub(ONE); id.gte(minId); id = id.sub(ONE)) {
    ids.push(id)
  }
  return ids
}

export type PaginationQuery = {
  page?: number | string | string[]
  size?: number | string | string[]
}

export type ParsedPaginationQuery = {
  page: number
  size: number
}

export const parsePageQuery = (props: PaginationQuery): ParsedPaginationQuery => {
  let { page = DEFAULT_FIRST_PAGE, size = DEFAULT_PAGE_SIZE } = props

  if (nonEmptyStr(page)) {
    page = tryParseInt(page, DEFAULT_FIRST_PAGE)
  }

  if (nonEmptyStr(size)) {
    size = tryParseInt(size, DEFAULT_PAGE_SIZE)
  }

  return {
    page: page as number,
    size: size as number
  }
}

export const getPageOfIds = <T = BN>(ids: T[], query: PaginationQuery): T[] => {
  const { page, size } = parsePageQuery(query)
  const offset = (page - 1) * size

  // If requested page is out of range of input array.
  if (offset >= ids.length) {
    return []
  }

  const pageOfIds = []
  for (let i = offset; i < offset + size; i++) {
    pageOfIds.push(ids[i])
  }

  return pageOfIds
}

export const approxCountOfPublicSpaces = (nextId: BN) =>
  nextId.subn(lastReservedSpaceId + 1)

export const approxCountOfPostPages = (nextId: BN, query: PaginationQuery) => {
  const { size } = parsePageQuery(query)
  const totalCount = nextId.subn(1).toNumber()
  return Math.ceil(totalCount / size)
}

export const approxCountOfSpacePages = (nextId: BN, query: PaginationQuery) => {
  const { size } = parsePageQuery(query)
  const totalCount = approxCountOfPublicSpaces(nextId).toNumber()
  return Math.ceil(totalCount / size)
}

export const canHaveNextPostPage = (nextId: BN, query: PaginationQuery) => {
  const { page } = parsePageQuery(query)
  return page < approxCountOfPostPages(nextId, query)
}

export const canHaveNextSpacePage = (nextId: BN, query: PaginationQuery) => {
  const { page } = parsePageQuery(query)
  return page < approxCountOfSpacePages(nextId, query)
}

const reverseClaimedSpaceIds = claimedSpaceIds.reverse()

const getReversePageOfIds = (nextId: BN, query: PaginationQuery) => {
  const { page, size } = parsePageQuery(query)
  const offset = (page - 1) * size
  const nextPageId = nextId.subn(offset)
  return getLastNIds(nextPageId, size)
}

export const getReversePageOfPostIds = getReversePageOfIds

export const getReversePageOfSpaceIds = (nextId: BN, query: PaginationQuery) => {
  let ids = getReversePageOfIds(nextId, query)
  if (!ids.length) {
    return []
  }

  const lowId = ids[ids.length - 1]
  
  // Exclude ids of reserved spaces:
  if (lowId.lten(lastReservedSpaceId)) {
    ids = ids.filter(id => id.gtn(lastReservedSpaceId))
  }
  
  const { size } = parsePageQuery(query)

  return ids.length < size
    ? [ ...ids, ...reverseClaimedSpaceIds ]
    : ids
}

export const getLastNSpaceIds = (nextId: BN, size: number): BN[] => {
  const spacesCount = approxCountOfPublicSpaces(nextId)
  const limit = spacesCount.ltn(size) ? spacesCount.toNumber() : size
  let spaceIds = getLastNIds(nextId, limit)

  // We append ids of claimed spaces in case we found
  // less number of the latest space ids than requested via `size` var.
  if (spaceIds.length < size && reverseClaimedSpaceIds.length > 0) {
    const claimedIds = reverseClaimedSpaceIds.slice(0, size - spaceIds.length)
    spaceIds = spaceIds.concat(claimedIds)
  }

  return spaceIds.slice(0, limit)
}
