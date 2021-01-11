import React from 'react'
import { ExtendedAddressProps } from './types'
import { Loading } from '../../../utils'
import { useMyAccount } from 'src/components/auth/MyAccountContext'
import { useFetchProfile } from 'src/rtk/app/hooks'

type Props = ExtendedAddressProps & {
  size?: number
  avatar?: string
  mini?: boolean
};

export function withLoadedOwner<P extends Props> (Component: React.ComponentType<any>) {
  return function (props: P) {
    const { owner: initialOwner, address } = props as Props

    if (initialOwner) return <Component {...props} />

    // TODO seems like this should be fixed: hook after if-clause ^^
    const { entity: owner, loading } = useFetchProfile({ id: address.toString() })

    return loading
      ? <Loading />
      : <Component {...props} owner={owner} />
  }
}

export function withMyProfile (Component: React.ComponentType<any>) {
  return function (props: any) {
    const { state: { account, address } } = useMyAccount()
    return address ? <Component owner={account} address={address} {...props} /> : null
  }
}
