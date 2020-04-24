import { AnyAccountId } from '@subsocial/types/substrate'
import { ProfileData } from '@subsocial/types'
import { BareProps } from '@polkadot/react-api/types'

export type CommonAddressProps = BareProps & {
  address: AnyAccountId,
  owner?: ProfileData
}

export type CommonProps = BareProps & CommonAddressProps & {
  children?: React.ReactNode,
  details?: JSX.Element
  isPadded?: boolean,
  isShort?: boolean,
  size?: number,
  withFollowButton?: boolean,
};