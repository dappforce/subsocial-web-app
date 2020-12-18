import React, { useState } from 'react'
import { AnyAccountId } from '@subsocial/types'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { newLogger } from '@subsocial/utils'
import { formatBalance } from '@polkadot/util'
import BN from 'bn.js'
import { Compact } from '@polkadot/types'
import { BareProps } from 'src/components/utils/types'

const log = newLogger('useCreateBallance')

// for million, 2 * 3-grouping + comma
const M_LENGTH = 6 + 1
const K_LENGTH = 3 + 1

function format (value: Compact<any> | BN | string, currency: string, decimals: number, withSi?: boolean, _isShort?: boolean): React.ReactNode {
  const [ prefix, postfix ] = formatBalance(value, { forceUnit: '-', withSi: false }).split('.')
  const isShort = _isShort || (withSi && prefix.length >= K_LENGTH)

  if (prefix.length > M_LENGTH) {
    // TODO Format with balance-postfix
    return formatBalance(value, { decimals })
  }

  return <>{prefix}{!isShort && (<>.<span className='DfBalanceDecimals'>{`000${postfix || ''}`.slice(-3)}</span></>)}&nbsp;{currency}</>
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

const useCreateBalance = (address: AnyAccountId) => {
  const [ balance, setBalance ] = useState<BN>()

  useSubsocialEffect(({ substrate }) => {
    let isMounted = true
    let unsub: (() => void) | undefined

    const sub = async () => {
      const api = await substrate.api

      unsub = await api.derive.balances.all(address, (data) => {
        const balance = data.freeBalance
        isMounted && setBalance(balance)
      })
    }

    isMounted && sub().catch(err => log.error(
      'Failed load balance:', err))

    return () => {
      unsub && unsub()
      isMounted = false
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
  const balance = useCreateBalance(address)

  if (!balance) return null

  return <span>
    {label}
    <FormatBalance value={balance} />
  </span>
}
