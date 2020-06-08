import React, { useState, useEffect } from 'react';
import { getAccountFromExtension } from './Api';
import { useMyAccount } from './MyAccountContext';
import { AddressPreviewWithOwner } from '../profiles/address-views';
import { Loading } from '.';
import { Button, Avatar } from 'antd';
import { useApi } from '@subsocial/react-hooks';

export const ChooseAccountFromExtension = () => {
  const [ accounts, setAccounts ] = useState<string[]>()
  const [ loading, setLoading ] = useState(true)
  const { setAddress, setInjectedAccounts } = useMyAccount()
  const { extensions } = useApi()

  useEffect(() => {
    const loadAddress = async () => {
      const account = await getAccountFromExtension(setInjectedAccounts)
      setAccounts(account)
      setLoading(false)
    }

    loadAddress().catch(err => console.error(err))

  }, [ false ])

  const NoExtension = () => (
    <>
      <div className='mb-4'>Polkadot extension was not found. You can install it if you are using Chrome or Firefox browser.</div>
      <Button block className='mb-2' type='default' href='https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd?hl=de' target='_blank' >
        <Avatar size={20} src='chrome.svg' />
        <span className='ml-2'>Polkadot extension for Chrome</span>
      </Button>
      <Button block type='default' href='https://addons.mozilla.org/ru/firefox/addon/polkadot-js-extension/' target='_blank' >
        <Avatar size={20} src='firefox.svg' />
        <span className='ml-2'>Polkadot extension for Firefox</span>
      </Button>
    </>
  )

  const NoAccounts = () => (
    <span>No account found. Please open your Polkadot extension and create a new account or import existing.</span>
  )

  const SelectAccounts = () => (
    <>
      <div>Click on your account to sign in:</div>
      <div className='text-left DfChooseAccountList'>
        {accounts?.map(item => <Button
          block
          key={item.toString()}
          className='DfChooseAccount mt-2'
          style={{ cursor: 'pointer', height: 'auto' }}
          onClick={() => setAddress(item)}
        >
          <AddressPreviewWithOwner address={item} mini />
        </Button>)}
      </div>
    </>
  )

  if (!extensions) return <NoExtension />;

  if (loading) return <Loading />

  return accounts?.length ? <SelectAccounts /> : <NoAccounts />
}
