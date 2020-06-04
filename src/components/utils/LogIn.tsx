import React, { useState, useEffect } from 'react';

import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import { isMobile } from 'react-device-detect';
import { Avatar } from 'antd';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { injectedExtension } from './injectedExtension';
import { useMyAccount } from './MyAccountContext';
import { useApi } from '@subsocial/react-hooks';
import { ProfilePreviewWithOwner } from '../profiles/address-views';
import { Loading } from '.';

type LogInButtonProps = {
  size?: string
};

export function LogInButton (props: LogInButtonProps) {
  const [ open, setOpen ] = useState(false);

  return <>
    <Button size={isMobile ? 'small' : 'default'} type='primary' ghost onClick={() => setOpen(true)}>Log In</Button>
    {open && <LogInModal open={open} hide={() => setOpen(false)} />}
  </>;
}

type ModalProps = {
  open: boolean
  hide: () => void
};

const ChooseAccount = () => {
  const [ accounts, setAccounts ] = useState<string[]>()
  const [ loading, setLoading ] = useState(true)
  const { set: setLogInAccount } = useMyAccount()
  const apiHooks = useApi()

  useEffect(() => {
    const loadAddress = async () => {
      const account = await injectedExtension(apiHooks)
      setAccounts(account)
      setLoading(false)
    }

    loadAddress().catch(err => console.error(err))

  }, [ isWeb3Injected ])

  const NoExtension = () => (
    <div>
      <span>Extension is not found, please download her:</span>
      <Button type='default' href='https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd?hl=de' target='_blank' >
        <Avatar size={20} src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Chrome_icon_%28September_2014%29.svg/1200px-Google_Chrome_icon_%28September_2014%29.svg.png' />
        <span className='ml-2'>Polkadot extension for Chrome</span>
      </Button>
      <Button type='default' href='https://addons.mozilla.org/ru/firefox/addon/polkadot-js-extension/' target='_blank' >
        <Avatar size={20} src='https://www.mozilla.org/media/protocol/img/logos/firefox/browser/logo-lg-high-res.fbc7ffbb50fd.png' />
        <span className='ml-2'>Polkadot extension for Mozila</span>
      </Button>
    </div>
  )

  const NoAccounts = () => (
    <span>Account is not found, please click on extension</span>
  )

  const SelectAccounts = () => (
    <>
      <h4>Select acount for log in:</h4>
      <div className='DfCard'>
        {accounts?.map(item => <div key={item.toString()} style={{ cursor: 'pointer' }} onClick={() => setLogInAccount(item)}>
          <ProfilePreviewWithOwner address={item} mini />
        </div>)}
      </div>
    </>
  )

  if (!isWeb3Injected) return <NoExtension />;

  if (loading) return <Loading />

  return accounts ? <SelectAccounts /> : <NoAccounts />
}

const LogInModal = (props: ModalProps) => {
  const { open = false, hide } = props;
  const [ currentContent, changeContent ] = useState(0)

  const SignInVariant = () => (
    <div>
      <Button type='default' onClick={() => changeContent(1)}>
        <Avatar size={20} src='https://addons.cdn.mozilla.net/user-media/addon_icons/2585/2585880-64.png?modified=3f638f7c' />
        <span className='ml-2'>Sign in with polkadot extension</span>
      </Button>
      <Button type='default' href='/bc/#/accounts' target='_blank' >
        <Avatar size={20} src='http://dapp.subsocial.network/bc/static/substrate-hexagon.d3f5a498.svg' />
        <span className='ml-2'>Create account on apps</span>
      </Button>
    </div>
  )

  const content = [
    <SignInVariant />,
    <ChooseAccount />
  ]

  return <Modal
    visible={open}
    title='Log In'
    onOk={hide}
    onCancel={hide}
    footer={[
      currentContent > 0 &&
        <Button key='back' onClick={() => changeContent(0)}>
          Back
        </Button>,
      <Button key='close' onClick={hide}>
        Close
      </Button> ]
    }
  >
    {content[currentContent]}
  </Modal>;
};

export default LogInButton;
