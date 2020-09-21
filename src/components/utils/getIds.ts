import { ZERO } from ".";
import { claimedSpaceIds } from "./env";
import BN from 'bn.js'

const RESERVED_SPACES = new BN(1000 + 1)

export const getLastNIds = (nextId: BN, size: BN): BN[] => {
  const idsCount = nextId.lte(size) ? nextId.toNumber() - 1 : size.toNumber();
  return new Array<BN>(idsCount)
    .fill(ZERO)
    .map((_, index) =>
      nextId.sub(new BN(index + 1)))
}

export const getLastNSpaceIds = (nextId: BN, size?: BN): BN[] => {
  const newSpaces = nextId.sub(RESERVED_SPACES)
  const spaceLimit = !size || newSpaces.lt(size) ? newSpaces : size
  const newSize = spaceLimit.subn(claimedSpaceIds.length)

  return [ ...claimedSpaceIds, ...getLastNIds(nextId, newSize) ]
}

export const getAllSpaceIds = (nextId: BN) => getLastNSpaceIds(nextId)
