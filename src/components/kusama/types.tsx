import { AccountId, Balance } from '@polkadot/types/interfaces'
import { AnyAccountId } from '@subsocial/types'
import { BareProps } from '../utils/types'

export type KusamaBareProps = BareProps & {
  address: AnyAccountId
}

export type KusamaInfo = {
  display: string,
  legal: string,
  web: string,
  riot: string,
  email: string,
  twitter: string
}

export type Proposal = {
  proposer: AccountId;
  value: Balance;
  beneficiary: AccountId;
  bond: Balance;
  id: number,
  status: 'passed' | 'active'
}

export type KusamaProposalDescProps = BareProps & {
  proposal: Proposal
  network: 'kusama' | 'polkadot'
}

export type KusamaInfoKeys = keyof KusamaInfo

export const identityInfoKeys: KusamaInfoKeys[] = [ 'display', 'legal', 'web', 'riot', 'email', 'twitter' ]
