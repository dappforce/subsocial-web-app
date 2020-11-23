import React, { useState, useCallback } from 'react'
import keyring from '@polkadot/ui-keyring'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { ProfileData } from '@subsocial/types'
import { SelectAddressPreview, ProfilePreviewWithOwner } from '../profiles/address-views'
import { Button, Avatar } from 'antd'
import { useMyAccount, useMyAddress } from '../auth/MyAccountContext'
import { isWeb3Injected } from '@polkadot/extension-dapp'
import { useAuth } from '../auth/AuthContext'
import SubTitle from '../utils/SubTitle'

import styles from './AccountSelector.module.sass'

type SelectAccountItems = {
  accounts: string[],
  profilesByAddressMap: Map<string, ProfileData>,
  withShortAddress?: boolean
}

const SelectAccountItems = ({ accounts: addresses, profilesByAddressMap, withShortAddress }: SelectAccountItems) => {
  const { setAddress, state: { address } } = useMyAccount()
  const { hideSignInModal } = useAuth()

  const AccountItem = useCallback((item: string) => <div
    key={item.toString()}
    className='SelectAccountItem'
    style={{ cursor: 'pointer', height: 'auto' }}
    onClick={async () => {
      await hideSignInModal()
      await setAddress(item)
    }}
  >
    <SelectAddressPreview address={item} owner={profilesByAddressMap.get(item)} withShortAddress={withShortAddress} />
  </div>, [ address || '', addresses.length ])

  return <div className='SelectAccountSection'>
    {addresses.map(AccountItem)}
  </div>
}

type AccountSelectorViewProps = {
  currentAddress?: string,
  extensionAddresses: string[],
  localAddresses: string[],
  developAddresses: string[],
  profilesByAddressMap: Map<string, ProfileData>
}

type AccountsPanelProps = {
  accounts: string[],
  kind: 'Extension' | 'Local' | 'Test'
}

const renderExtensionContent = (content: JSX.Element) => {
  return <>
    <SubTitle title={'Extension accounts:'} />
    {content}
  </>
}

export const AccountSelectorView = ({ currentAddress = '', extensionAddresses, localAddresses, developAddresses, profilesByAddressMap }: AccountSelectorViewProps) => {
  const noAccounts = !extensionAddresses.length && !localAddresses.length && !developAddresses.length

  const NoExtension = useCallback(() => (
    <div className='text-center mb-3'>
      <div className='mb-3 mx-3'>
        <a className='DfBoldBlackLink' href='https://github.com/polkadot-js/extension' rel='noreferrer' target='_blank'>Polkadot extension</a>{' '}
        was not found or disabled. Please enable the extension or install it from one of the links below.
      </div>
      <div className='mx-5'>
        <Button block className='mb-2' type='default' href='https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd?hl=de' target='_blank' >
          <Avatar size={20} src='/chrome.svg' />
          <span className='ml-2'>Polkadot extension for Chrome</span>
        </Button>
        <Button block type='default' href='https://addons.mozilla.org/firefox/addon/polkadot-js-extension/' target='_blank' >
          <Avatar size={20} src='/firefox.svg' />
          <span className='ml-2'>Polkadot extension for Firefox</span>
        </Button>
      </div>
    </div>
  ), [])

  const NoExtensionAccounts = useCallback(() => (
    <div className='m-3 text-center'>
      No accounts found. Please open your Polkadot extension and create a new account or import existing. Then reload this page.
    </div>
  ), [])

  const CurrentAccount = useCallback(() => {
    if (noAccounts && !currentAddress) return null

    if (!currentAddress) return <div className='m-3'>Click on your account to sign in:</div>

    return <>
      <div className='p-3 pb-0'>
        <ProfilePreviewWithOwner
          address={currentAddress}
          owner={profilesByAddressMap.get(currentAddress)}
          size={60}
          className='justify-content-center'
        />
      </div>
    </>
  }, [ currentAddress ])

  const AccountPanel = useCallback(({ accounts, kind }: AccountsPanelProps) => {
    const count = accounts.length

    if (!count) return null

    return <>
      <SubTitle title={`${kind} accounts:`} />
      <SelectAccountItems accounts={accounts} profilesByAddressMap={profilesByAddressMap} withShortAddress/>
    </>
  }, [])

  const ExtensionAccountPanel = () => {
    const count = extensionAddresses.length

    const isInjectCurrentAddress = currentAddress && keyring.getAccount(currentAddress)?.meta.isInjected // FIXME: hack that hides NoAccount msg!!!

    if (!isWeb3Injected) return <NoExtension />

    if (!count && isInjectCurrentAddress) return null

    if (!count) return renderExtensionContent(<NoExtensionAccounts />)

    return renderExtensionContent(
      <SelectAccountItems
        accounts={extensionAddresses}
        profilesByAddressMap={profilesByAddressMap}
        withShortAddress
      />
    )
  }

  return <div>
    <CurrentAccount />
    <div className={styles.DfAccountSelector}>
      <ExtensionAccountPanel />
      <AccountPanel accounts={localAddresses} kind='Local' />
      <AccountPanel accounts={developAddresses} kind='Test'/>
    </div>
  </div>
}

type AccountSelectorProps = {
  injectedAddresses?: string[]
}

export const useAccountSelector = ({ injectedAddresses }: AccountSelectorProps) => {
  const [ extensionAddresses, setExtensionAddresses ] = useState<string[]>(injectedAddresses || [])
  const [ localAddresses, setLocalAddresses ] = useState<string[]>()
  const [ developAddresses, setDevelopAddresses ] = useState<string[]>()
  const [ profilesByAddressMap ] = useState(new Map<string, ProfileData>())
  const currentAddress = useMyAddress()

  useSubsocialEffect(({ subsocial }) => {
    const accounts = keyring.getAccounts()
    if (!accounts) return

    const loadProfiles = async () => {
      const extensionAddresses: string[] = []
      const developAddresses: string[] = []
      const localAddresses: string[] = []

      const addresses = accounts.map(account => {
        const { address, meta } = account

        if (address === currentAddress) return address

        if (meta.isInjected) {
          extensionAddresses.push(address)
        } /* else if (meta.isTesting) {
          developAddresses.push(address)
        } else {
          localAddresses.push(address)
        } */
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
    }

    loadProfiles().catch(err => console.error(err))// TODO change on logger
  }, [ currentAddress ])

  return {
    extensionAddresses,
    localAddresses,
    developAddresses,
    profilesByAddressMap,
    currentAddress
  }
}

export const AccountSelector = ({ injectedAddresses }: AccountSelectorProps) => {
  const {
    extensionAddresses,
    localAddresses,
    developAddresses,
    profilesByAddressMap,
    currentAddress
  } = useAccountSelector({ injectedAddresses })

  return !extensionAddresses || !localAddresses || !developAddresses
    ? null
    : <AccountSelectorView
      extensionAddresses={extensionAddresses}
      localAddresses={localAddresses}
      developAddresses={developAddresses}
      profilesByAddressMap={profilesByAddressMap}
      currentAddress={currentAddress}
    />
}
