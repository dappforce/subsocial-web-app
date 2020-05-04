import BN from 'bn.js'
import { Text, GenericAccountId, Option } from '@polkadot/types'
import { AccountId } from '@polkadot/types/interfaces'
import AbstractInt from '@polkadot/types/codec/AbstractInt'

function toString<DFT> (value?: { toString: () => string }, _default?: DFT): string | DFT | undefined {
  return value && typeof value.toString === 'function'
    ? value.toString()
    : _default
}

export type AnyText = string | Text | Option<Text>

export type AnyNumber = number | BN | AbstractInt | Option<AbstractInt>

export type AnyAddress = string | AccountId | GenericAccountId | Option<AccountId> | Option<GenericAccountId>

export function stringifyAny<DFT> (value?: any, _default?: DFT): string | DFT | undefined {
  if (typeof value !== 'undefined') {
    if (value instanceof Option) {
      return stringifyText(value.unwrapOr(undefined))
    } else {
      return toString(value)
    }
  }
  return _default
}

export function stringifyText<DFT> (value?: AnyText, _default?: DFT): string | DFT | undefined {
  return stringifyAny(value, _default)
}

export function stringifyNumber<DFT> (value?: AnyNumber, _default?: DFT): string | DFT | undefined {
  return stringifyAny(value, _default)
}

export function stringifyAddress<DFT> (value?: AnyAddress, _default?: DFT): string | DFT | undefined {
  return stringifyAny(value, _default)
}
