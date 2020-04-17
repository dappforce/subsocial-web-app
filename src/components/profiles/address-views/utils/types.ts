import { SocialAccount, AccountId } from '@subsocial/types/substrate/interfaces'
import { Text } from '@polkadot/types'
import { ProfileContent } from '@subsocial/types'

export type ProfileProps = {
  fullname?: string,
  username?: Text | string,
  address: AccountId | string,
}

export type CommonAddressProps = {
  address: string,
  socialAccount?: SocialAccount,
  content?: ProfileContent,
  username?: string | Text,
}
