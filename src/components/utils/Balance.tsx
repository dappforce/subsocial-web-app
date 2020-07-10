import React, { useState } from 'react'
import { AnyAccountId } from '@subsocial/types';
import useSubsocialEffect from '../api/useSubsocialEffect'
import { gtZero } from '.';
import { newLogger } from '@subsocial/utils';

const log = newLogger('useGetBallance')

const useGetBalance = (address: AnyAccountId) => {
  const [ balance, setBalance ] = useState<string>()

  useSubsocialEffect(({ substrate }) => {
    let unsub: (() => void) | undefined;

    const sub = async () => {
      const api = await substrate.api;

      unsub = await api.derive.balances.all(address, (data) => {
        const balance = data.freeBalance
        gtZero(balance) && setBalance(balance.toString())
      });
    }

    sub().catch(err => log.error('Failed load balance %o', err))

    return () => unsub && unsub()
  })

  return balance
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
