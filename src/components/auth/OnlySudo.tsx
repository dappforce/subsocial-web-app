import React from 'react'
import NoData from '../utils/EmptyList'
import { Loading } from '../utils'
import { useMyAddress } from './MyAccountContext'
import { equalAddresses } from '../substrate'
import { useLoadSudo } from 'src/hooks/useLoadSudo'

export const NotSudo = React.memo(() =>
  <NoData description='Only sudo user can access this page' />
)

type OnlySudoProps = React.PropsWithChildren<{}>

export const OnlySudo = ({ children }: OnlySudoProps) => {
  const myAddress = useMyAddress()
  const sudo = useLoadSudo()
  const iAmSudo = equalAddresses(myAddress, sudo)

  return sudo
    ? <>
      {/* <div>Sudo: <b><code>{sudo.toString()}</code></b></div> */}
      {iAmSudo ? children : <NotSudo />}
    </>
    : <Loading label='Loading sudo account...' />
}
