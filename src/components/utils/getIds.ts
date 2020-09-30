import { ZERO } from ".";
import { claimedSpaceIds, lastReservedSpaceId } from "./env";
import BN from 'bn.js'
import { parsePageQuery } from "../lists/utils";
import { ParsedUrlQuery } from 'querystring';

export const getLastNIds = (nextId: BN, size: number): BN[] => {
  const idsCount = nextId.lten(size) ? nextId.toNumber() - 1 : size;
  return new Array<BN>(idsCount)
    .fill(ZERO)
    .map((_, index) =>
      nextId.sub(new BN(index + 1)))
}

export const getPageOfIds = (ids: BN[], query: ParsedUrlQuery) => {
  const { size, page } = parsePageQuery(query)
  const offset = size * (page - 1)

  const pageOfIds = []

  for (let i = offset; i < offset + size; i++) {
    pageOfIds.push(ids[offset + i])
  }
  return pageOfIds
}

export const resolveNextSpaceId = (nextId: BN) => nextId.subn(lastReservedSpaceId + 1)

export const getSpacePageOfIds = (nextId: BN, query: ParsedUrlQuery) => {
  const { size, page } = parsePageQuery(query)

  const offset = size * (page - 1)
  const nextPageId = nextId.subn(offset)

  const ids = getLastNIds(nextPageId, size)

  return ids.length < size
    ? [ ...ids, ...claimedSpaceIds ]
    : ids
}

export const getLastNSpaceIds = (nextId: BN, size: number): BN[] => {
  const newSpacesCount = resolveNextSpaceId(nextId)

  const limit = newSpacesCount.lten(size) ? newSpacesCount.toNumber() : size
  const spaceIds = [ ...claimedSpaceIds, ...getLastNIds(nextId, limit) ]

  return spaceIds.slice(spaceIds.length - limit)
}
