import React, { useState } from 'react'
import AccountId from '@polkadot/types/generic/AccountId'
import useSubsocialEffect from '../api/useSubsocialEffect'
import NoData from '../utils/EmptyList'
import { Loading } from '../utils'
import { useMyAddress } from './MyAccountContext'
import { equalAddresses } from '../substrate'

export const NotSudo = React.memo(() =>
  <NoData description='Only sudo user can access this page' />
)

type OnlySudoProps = React.PropsWithChildren<{}>

export const OnlySudo = ({ children }: OnlySudoProps) => {
  const myAddress = useMyAddress()
  const [ sudo, setSudo ] = useState<AccountId>()
  
  useSubsocialEffect(({ substrate }) => {
    const load = async () => {
      const api = await substrate.api
      const sudo = await api.query.sudo.key()
      setSudo(sudo)
    }
    load()
  }, [])

  const iAmSudo = equalAddresses(myAddress, sudo)

  return sudo
    ? <>
      {/* <div>Sudo: <b><code>{sudo.toString()}</code></b></div> */}
      {iAmSudo ? children : <NotSudo />}
    </>
    : <Loading label='Loading sudo account...' />
}
