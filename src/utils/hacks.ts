import { AnyAccountId, AnySpaceId } from '@subsocial/types'
import { equalAddresses } from 'src/components/substrate'

function isReservedPolkadotSpace (id: AnySpaceId): boolean {
  return id.gten(1001) && id.lten(1217)
}

/**
 * Simple check if this is an id is of a Polkadot ecosystem project.
 */
export function isPolkaProject (id: AnySpaceId): boolean {
  // TODO This logic should be imroved later.
  return id.eqn(1) || isReservedPolkadotSpace(id)
}

export function findSpaceIdsThatCanSuggestIfSudo (sudoAcc: AnyAccountId, myAcc: AnyAccountId, spaceIds: AnySpaceId[]): AnySpaceId[] {
  const isSudo = equalAddresses(sudoAcc, myAcc)
  return !isSudo ? spaceIds : spaceIds.filter(id => !isReservedPolkadotSpace(id))
}