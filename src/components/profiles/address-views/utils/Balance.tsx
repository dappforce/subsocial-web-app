import React, { useState } from 'react'
import { AnyAccountId } from '@subsocial/types';
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { newLogger } from '@subsocial/utils';
import { formatBalance } from '@polkadot/util';
import BN from 'bn.js'

const log = newLogger('useGetBallance')

const useGetBalance = (address: AnyAccountId) => {
  const [ balance, setBalance ] = useState<BN>()
  // const [ currency ] = useState(formatBalance.getDefaults().unit);
  useSubsocialEffect(({ substrate }) => {
    let unsub: (() => void) | undefined;

    const sub = async () => {
      const api = await substrate.api;

      unsub = await api.derive.balances.all(address, (data) => {
        const balance = data.freeBalance
        setBalance(balance)
      });
    }

    sub().catch(err => log.error('Failed load balance %o', err))

    return () => unsub && unsub()
  })

  if (!balance) return null

  return formatBalance(balance)
}

type BalanceProps = {
  address: AnyAccountId,
  label?: React.ReactNode
}

export const Balance = ({ address, label }: BalanceProps) => {
  const balance = useGetBalance(address)

  if (!balance) return null;

  return <span className='DfBalance'>
    {label}
    {balance}
  </span>
}
