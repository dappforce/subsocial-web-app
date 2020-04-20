import { AnyAccountId } from '@subsocial/types/substrate/interfaces'
import { ProfileData } from '@subsocial/types'
import { BareProps } from '@polkadot/react-api/types'

export type CommonAddressProps = BareProps & {
  address: AnyAccountId,
  owner?: ProfileData
}
