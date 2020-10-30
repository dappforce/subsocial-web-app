import React, { useState } from 'react'
import { AnyAccountId } from '@subsocial/types';
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { newLogger } from '@subsocial/utils';
import { formatBalance } from '@polkadot/util';
import BN from 'bn.js'
import { Compact } from '@polkadot/types';
import { BareProps } from 'src/components/utils/types';

const log = newLogger('useGetBallance')

// for million, 2 * 3-grouping + comma
const M_LENGTH = 6 + 1;
const K_LENGTH = 3 + 1;

function format (value: Compact<any> | BN | string, currency: string, decimals: number, withSi?: boolean, _isShort?: boolean): React.ReactNode {
  const [ prefix, postfix ] = formatBalance(value, { forceUnit: '-', withSi: false }).split('.');
  const isShort = _isShort || (withSi && prefix.length >= K_LENGTH);

  if (prefix.length > M_LENGTH) {
    // TODO Format with balance-postfix
    return formatBalance(value, { decimals });
  }

  return <>{prefix}{!isShort && (<>.<span className='DfBalanceDecimals'>{`000${postfix || ''}`.slice(-3)}</span></>)}&nbsp;{currency}</>;
}

type FormatBalanceProps = BareProps & {
  value?: Compact<any> | BN | string,
  decimals?: number,
  currency?: string
}

export const FormatBalance = ({ value, decimals, currency, ...bareProps }: FormatBalanceProps) => {
  if (!value) return null

  const { unit: defaultCurrency, decimals: defaultDecimal } = formatBalance.getDefaults()

  return <span {...bareProps}>{format(value, currency || defaultCurrency, decimals || defaultDecimal)}</span>
}

const useGetBalance = (address: AnyAccountId) => {
  const [ balance, setBalance ] = useState<BN>()

  useSubsocialEffect(({ substrate }) => {
    let unsub: (() => void) | undefined;
    let isSubscribe = true

    const sub = async () => {
      const api = await substrate.api;

      unsub = await api.derive.balances.all(address, (data) => {
        const balance = data.freeBalance
        isSubscribe && setBalance(balance)
      });
    }

    isSubscribe && sub().catch(err => log.error('Failed load balance %o', err))

    return () => {
      unsub && unsub()
      isSubscribe = false
    }
  }, [ address ])

  if (!balance) return null

  return balance
}

type BalanceProps = {
  address: AnyAccountId,
  label?: React.ReactNode
}

export const Balance = ({ address, label }: BalanceProps) => {
  const balance = useGetBalance(address)

  if (!balance) return null;

  return <span>
    {label}
    <FormatBalance value={balance} />
  </span>
}
