import { AnyAccountId } from '@subsocial/types/substrate'
import { ProfileData } from '@subsocial/types'

export type AddressProps = {
  className?: string
  style?: Record<string, any>
  address: AnyAccountId,
  owner?: ProfileData
}

export type ExtendedAddressProps = AddressProps & {
  children?: React.ReactNode,
  afterName?: JSX.Element
  details?: JSX.Element
  isPadded?: boolean,
  isShort?: boolean,
  size?: number,
  withFollowButton?: boolean,
};
