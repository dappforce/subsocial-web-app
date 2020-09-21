import { ZERO } from ".";
import { claimedSpaceIds, lastReservedSpaceId } from "./env";
import BN from 'bn.js'

export const getLastNIds = (nextId: BN, size: BN): BN[] => {
  const idsCount = nextId.lte(size) ? nextId.toNumber() - 1 : size.toNumber();
  return new Array<BN>(idsCount)
    .fill(ZERO)
    .map((_, index) =>
      nextId.sub(new BN(index + 1)))
}

export const getLastNSpaceIds = (nextId: BN, size: BN): BN[] => {
  const newSpacesCount = nextId.subn(lastReservedSpaceId + 1)

  const limit = newSpacesCount.lte(size) ? newSpacesCount : size
  const spaceIds = [ ...claimedSpaceIds, ...getLastNIds(nextId, limit) ]

  return spaceIds.slice(spaceIds.length - limit.toNumber())
}

export const getAllSpaceIds = (nextId: BN) =>
  [ ...claimedSpaceIds, ...getLastNIds(nextId, nextId.subn(lastReservedSpaceId + 1)) ]

