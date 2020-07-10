import React, { useState } from 'react'
import { AnyAccountId } from '@subsocial/types';
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { newLogger } from '@subsocial/utils';
import { formatBalance } from '@polkadot/util';
import BN from 'bn.js'
import { Compact } from '@polkadot/types';

const log = newLogger('useGetBallance')

// for million, 2 * 3-grouping + comma
const M_LENGTH = 6 + 1;
const K_LENGTH = 3 + 1;

function format (value: Compact<any> | BN | string, currency: string, withSi?: boolean, _isShort?: boolean): React.ReactNode {
  const [ prefix, postfix ] = formatBalance(value, { forceUnit: '-', withSi: false }).split('.');
  const isShort = _isShort || (withSi && prefix.length >= K_LENGTH);

  if (prefix.length > M_LENGTH) {
    // TODO Format with balance-postfix
    return formatBalance(value);
  }

  return <>{prefix}{!isShort && (<>.<span className='ui--FormatBalance-postfix'>{`000${postfix || ''}`.slice(-3)}</span></>)} {currency}</>;
}

const useGetBalance = (address: AnyAccountId) => {
  const [ balance, setBalance ] = useState<BN>()
  const [ currency ] = useState(formatBalance.getDefaults().unit);
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

  return format(balance, currency)
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
