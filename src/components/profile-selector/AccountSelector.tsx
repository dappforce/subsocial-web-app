import React, { useState, useEffect } from 'react'
import keyring from '@polkadot/ui-keyring';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { ProfileData } from '@subsocial/types';
import { SelectAddressPreview } from '../profiles/address-views';
import { Loading } from '../utils';
import { Button, Avatar, Divider } from 'antd';
import { useMyAccount, useMyAddress } from '../auth/MyAccountContext';
import { isWeb3Injected } from '../utils/Api';
import { useAuth } from '../auth/AuthContext';

type SelectAccountButtons = {
  accounts: string[],
  profilesByAddressMap: Map<string, ProfileData>
}

const SelectAccountButtons = ({ accounts: addresses, profilesByAddressMap }: SelectAccountButtons) => {
  const { setAddress } = useMyAccount()
  const { hideSignInModal } = useAuth()

  return <>
    {addresses.map(item => <Button
      block
      key={item.toString()}
      className='DfChooseAccountButton mt-2'
      style={{ cursor: 'pointer', height: 'auto' }}
      onClick={async () => {
        await hideSignInModal()
        await setAddress(item)
      }}
    >
      <SelectAddressPreview address={item} owner={profilesByAddressMap.get(item)} />
    </Button>)}
  </>
}

type AccountSelectorViewProps = {
  currentAddress?: string,
  extensionAddresses: string[],
  localAddresses: string[],
  developAddresses: string[],
  profilesByAddressMap: Map<string, ProfileData>
}

export const AccountSelectorView = ({ currentAddress, extensionAddresses, localAddresses, developAddresses, profilesByAddressMap }: AccountSelectorViewProps) => {
  const NoExtension = () => (
    <>
      <div className='mb-4'>
        <a className='DfBlackLink' href='https://github.com/polkadot-js/extension' target='_blank'>Polkadot extension</a>{' '}
        was not found or disabled. You can install it if you are using Chrome or Firefox browser.
      </div>
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
    <span>No accounts found. Please open your Polkadot extension and create a new account or import existing.</span>
  )

  const CurrentAccount = () => {
    if (!currentAddress) return <div>Click on your account to sign in:</div>

    return <>
      <Divider className='mt-0'>Current account:</Divider>
      <div style={{ paddingLeft: '.75rem' }}><SelectAddressPreview address={currentAddress} owner={profilesByAddressMap.get(currentAddress)} /></div>
    </>
  }

  type AccountsPanelProps = {
    accounts: string[],
    kind: 'Extension' | 'Local' | 'Test'
  }

  const AccountPanel = ({ accounts, kind }: AccountsPanelProps) => {
    const count = accounts.length;

    if (!count) return null

    return <>
      <Divider>{kind} accounts:</Divider>
      <SelectAccountButtons accounts={accounts} profilesByAddressMap={profilesByAddressMap} />
    </>
  }

  const ExtensionAccountPanel = () => {
    const count = extensionAddresses.length

    const renderContent = (content: JSX.Element) => {
      return <>
        <Divider>Extension accounts:</Divider>
        {content}
      </>
    }

    if (!isWeb3Injected) {
      return renderContent(<NoExtension />)
    }

    if (!count) return renderContent(<NoAccounts />)

    return renderContent(<SelectAccountButtons accounts={extensionAddresses} profilesByAddressMap={profilesByAddressMap} />)

  }

  return <div className='DfAccountSelector'>
    <CurrentAccount />
    <ExtensionAccountPanel />
    <AccountPanel accounts={localAddresses} kind='Local' />
    <AccountPanel accounts={developAddresses} kind='Test'/>
  </div>
}

type AccountSelectorProps = {
  injectedAddresses?: string[]
}

export const AccountSelector = ({ injectedAddresses }: AccountSelectorProps) => {
  const [ extensionAddresses, setExtensionAddresses ] = useState<string[]>(injectedAddresses || [])
  const [ localAddresses, setLocalAddresses ] = useState<string[]>()
  const [ developAddresses, setDevelopAddresses ] = useState<string[]>()
  const [ profilesByAddressMap ] = useState(new Map<string, ProfileData>())
  const currentAddress = useMyAddress()
  const { subsocial } = useSubsocialApi()

  useEffect(() => {
    const accounts = keyring.getAccounts()

    if (!accounts) return

    const loadProfiles = async () => {
      const extensionAddresses: string[] = []
      const developAddresses: string[] = []
      const localAddresses: string[] = []

      const addresses = accounts.map(account => {
        const { address, meta } = account;

        if (address === currentAddress) return address

        if (meta.isInjected) {
          console.log(account)
          extensionAddresses.push(address)
        } else if (meta.isTesting) {
          console.log(address)
          developAddresses.push(address)
        } else {
          console.log(address)
          localAddresses.push(address)
        }
        return address
      })
      const uniqExtAddresses = new Set(extensionAddresses).values()
      setExtensionAddresses([ ...uniqExtAddresses ])
      setLocalAddresses(localAddresses)
      setDevelopAddresses(developAddresses)

      const profiles = await subsocial.findProfiles(addresses)

      profiles.forEach((item) => {
        const address = item.profile?.created.account.toString()
        address && profilesByAddressMap.set(address, item)
      })
      console.log(extensionAddresses, developAddresses)
    }

    loadProfiles().catch(err => console.error(err))// TODO change on logger
  }, [ currentAddress ])

  if (!extensionAddresses || !localAddresses || !developAddresses) return <Loading />

  return <AccountSelectorView
    extensionAddresses={extensionAddresses}
    localAddresses={localAddresses}
    developAddresses={developAddresses}
    profilesByAddressMap={profilesByAddressMap}
    currentAddress={currentAddress} />
}
