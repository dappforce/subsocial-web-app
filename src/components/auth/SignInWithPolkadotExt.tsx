import React, { useState, useEffect } from 'react';
import { getAccountFromExtension, isWeb3Injected } from '../utils/Api';
import { useMyAccount } from './MyAccountContext';
import { Loading } from '../utils';
import { AccountSelector } from '../profile-selector/AccountSelector';

export const SignInFromExtension = () => {
  const [ loading, setLoading ] = useState(true)
  const { setInjectedAccounts } = useMyAccount()

  useEffect(() => {
    const loadAddress = async () => {
      getAccountFromExtension(setInjectedAccounts)
      setLoading(false)
    }

    loadAddress().catch(err => console.error(err))

  }, [ isWeb3Injected ])

  const SelectAccounts = () => (
    <div className='text-left DfChooseAccountList mt-4'>
      <AccountSelector />
    </div>
  )

  return loading ? <Loading/> : <SelectAccounts />
}
