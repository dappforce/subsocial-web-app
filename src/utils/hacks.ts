import BN from 'bn.js'

/**
 * Simple check if this is an id is of a Polkadot ecosystem project.
 */
export const isPolkaProject = (id: BN) => {
  // TODO This logicshould be imroved later.
  return id.eqn(1) || (id.gtn(1000) && id.ltn(1218))
}
