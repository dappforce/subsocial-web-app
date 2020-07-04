import React, { useState, useEffect } from 'react';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { getAccountFromExtension } from '../utils/Api';
import { useMyAccount } from './MyAccountContext';
import { Loading } from '../utils';
import { AccountSelector } from '../profile-selector/AccountSelector';

export const SignInFromExtension = () => {
  const { setInjectedAccounts } = useMyAccount()
  const [ addresses, setAddresses ] = useState<string[]>()
  useEffect(() => {
    const loadAddress = async () => {
      const accounts = await getAccountFromExtension(setInjectedAccounts)
      console.log('Acccounts:', accounts)
      setAddresses(accounts)
    }

    loadAddress().catch(err => console.error(err))

  }, [ isWeb3Injected ])

  return !addresses ? <Loading/> : <AccountSelector injectedAddresses={addresses} />
}
