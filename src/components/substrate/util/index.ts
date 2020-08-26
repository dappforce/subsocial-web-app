import BN from 'bn.js'
import { Text, GenericAccountId, Option } from '@polkadot/types'
import { AccountId } from '@polkadot/types/interfaces'
import AbstractInt from '@polkadot/types/codec/AbstractInt'
import { AddressProps } from 'src/components/profiles/address-views/utils/types'
import { toShortAddress } from 'src/components/utils'
import { Codec } from '@polkadot/types/types'
import { SubstrateId, AnyAccountId } from '@subsocial/types'
import { SubmittableResult } from '@polkadot/api'
import { getSubsocialApi } from 'src/components/utils/SubsocialConnect';
import { SubsocialApi } from '@subsocial/api/subsocial';
export * from './getTxParams'
export * from './queryToProps'
export { isEqual } from './isEqual';
export { triggerChange } from './triggerChange';

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

export const getSpaceId = async (idOrHandle: string, subsocial?: SubsocialApi): Promise<BN | undefined> => {
  if (idOrHandle.startsWith('@')) {
    const handle = idOrHandle.substring(1) // Drop '@'
    const { substrate } = subsocial || await getSubsocialApi()
    return substrate.getSpaceIdByHandle(handle)
  } else {
    return new BN(idOrHandle)
  }
}

export function getNewIdFromEvent (txResult: SubmittableResult): BN | undefined {
  let id: BN | undefined;

  txResult.events.find(event => {
    const {
      event: { data, method }
    } = event;
    if (method.indexOf(`Created`) >= 0) {
      const [ /* owner */, newId ] = data.toArray();
      id = newId as unknown as BN;
      return true;
    }
    return false;
  });

  return id;
}

export const getAccountId = async (addressOrHandle: string): Promise<AnyAccountId | undefined> => {
  if (addressOrHandle.startsWith('@')) {
    const handle = addressOrHandle.substring(1) // Drop '@' char.
    const { substrate } = await getSubsocialApi()
    return substrate.getAccountIdByHandle(handle)
  } else {
    return addressOrHandle
  }
}

export function equalAddresses (addr1?: string | AccountId, addr2?: string | AccountId) {
  return toString(addr1) === toString(addr2)
}

type GetNameOptions = AddressProps & {
  isShort?: boolean
}

export const getProfileName = (options: GetNameOptions) => {
  const { owner, isShort = true, address } = options
  return (
    owner?.content?.fullname ||
    owner?.profile?.handle ||
    (isShort ? toShortAddress(address) : address)
  ).toString()
}

export const unwrapSubstrateId = (optId?: Option<Codec>): SubstrateId | undefined => {
  if (optId instanceof Option) {
    return optId.unwrapOr(undefined) as any
  }

  return optId && optId as SubstrateId
}

export * from './getTxParams'
