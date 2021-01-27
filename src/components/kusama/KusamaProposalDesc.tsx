import React, { useCallback, useEffect, useState } from 'react'
import { NameWithOwner } from '../profiles/address-views/Name'
import { InfoPanel, DescItem } from '../profiles/address-views/InfoSection'
import { KusamaProposalDescProps, Proposal } from './types'
import styles from './index.module.sass'
import { Tag } from 'antd';
import { AnyAccountId, ProposalContent } from '@subsocial/types';
import { useKusamaContext } from './KusamaContext';
import { startWithUpperCase } from '../utils';
import { BareProps } from '../utils/types';
import { FormatBalance } from '../profiles/address-views/utils/Balance';
import { Balance } from '@polkadot/types/interfaces'

type KusamaProposalProps = BareProps & {
  proposal?: ProposalContent
}

const createPassProposal = (proposalIndex: number): Proposal => ({ id: proposalIndex, status: 'passed' } as Proposal)

export const useLoadKusamaProposal = (proposalIndex: number) => {
  const { api, hasKusamaConnection } = useKusamaContext()
  const [ proposalStruct, setProposal ] = useState<Proposal>()

  useEffect(() => {
    if (!api) return

    const loadProposal = async () => {
      const proposalOpt = await api.query.treasury.proposals(proposalIndex)
      const treasuryProposal = proposalOpt.unwrapOr(undefined)

      const proposal: Proposal = treasuryProposal
        ? { ...treasuryProposal, status: 'active', id: proposalIndex }
        : createPassProposal(proposalIndex)

      setProposal(proposal)
    }

    loadProposal().catch(console.error)
  }, [ proposalIndex || 0, !api ])

  if (!proposalStruct || !hasKusamaConnection) return undefined

  return proposalStruct
}

export const useIsProposer = (address: AnyAccountId, proposalIndex?: number) => {
  if (!proposalIndex) return false

  const proposal = useLoadKusamaProposal(proposalIndex)
  const { isEqualKusamaAddress } = useKusamaContext()
  if (!proposal) return false

  return isEqualKusamaAddress(address, proposal.proposer)
}

type ProposerTagProps = {
  address: AnyAccountId,
  proposalIndex?: number
}

export const ProposerTag = ({ address, proposalIndex }: ProposerTagProps) => useIsProposer(address, proposalIndex)
  ? <Tag color='volcano' className='m-0'>Proposer</Tag>
  : null

export const KusamaProposalView = ({ proposal, ...bareProps }: KusamaProposalProps) => {
  if (!proposal) return null

  const { proposalIndex, network } = proposal

  const proposalStruct = useLoadKusamaProposal(proposalIndex)

  if (!proposalStruct) return null

  return <KusamaProposalDesc proposal={proposalStruct} network={network} {...bareProps} />
}

export const KusamaProposalDesc = ({ proposal: { proposer, beneficiary, value, bond, id, status }, network, className, ...bareProps }: KusamaProposalDescProps) => {
    const { tokenOptions: { decimals, currency } } = useKusamaContext()

    const renderBalance = useCallback((value: Balance) =>
      <FormatBalance value={value} currency={currency} decimals={decimals} style={{ fontWeight: 600 }} />, [ value ])

    const isActive = status === 'active'
    const commonItems: DescItem[] = [
      {
        label: `${startWithUpperCase(network)} proposal id`,
        value: <b>{id}</b>
      },
      {
        label: 'Status',
        value: <Tag color={isActive ? 'blue' : 'default'} >{startWithUpperCase(status)}</Tag>
      }
    ]
  
    const items: DescItem[] = isActive
      ? [
        ...commonItems,
        {
          label: 'Proposer',
          value: <NameWithOwner address={proposer} />
        },
        {
          label: 'Requested amount',
          value: renderBalance(value)
        },
        {
          label: 'Beneficiary',
          value: <NameWithOwner address={beneficiary} />
        },
        {
          label: 'Bonded amount',
          value: renderBalance(bond)
        }
      ]
      : commonItems
  
    return <InfoPanel
      {...bareProps}
      className={`${styles.ProposalDesc} ${isActive && styles.active} ${className}`}
      items={items}
      layout='horizontal'
      column={2}
    />
  }