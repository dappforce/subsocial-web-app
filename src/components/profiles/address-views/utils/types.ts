import { AnyAccountId } from '@subsocial/types/substrate'
import { ProfileData } from '@subsocial/types'
import { BareProps } from '@subsocial/react-api/types'

export type AddressProps = BareProps & {
  address: AnyAccountId,
  owner?: ProfileData
}

export type ExtendedAddressProps = AddressProps & {
  children?: React.ReactNode,
  details?: JSX.Element
  isPadded?: boolean,
  isShort?: boolean,
  size?: number,
  withFollowButton?: boolean,
};
