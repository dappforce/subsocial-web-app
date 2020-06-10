import React, { useState } from 'react';

import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import { isMobile } from 'react-device-detect';
import { Avatar, Divider, Alert } from 'antd';
import { ChooseAccountFromExtension } from './PolkadotExtension';
import { useMyAccount, useIsSignIn } from './MyAccountContext';
import { OnBoardingButton } from '../onboarding';
import { AddressPopupWithOwner } from '../profiles/address-views';

export const AuthorizationPanel = () => {
  const [ open, setOpen ] = useState<boolean>(false);
  const { state: { address } } = useMyAccount()
  const isSignIn = useIsSignIn()
  return <>
    {isSignIn && address && !open ? <AddressPopupWithOwner
      className='profileName'
      address={address}
    /> : <LogInButton onClick={() => setOpen(true)} />}
    <LogInModal open={open} hide={() => setOpen(false)} />
  </>
}

type LogInButtonProps = {
  size?: string,
  link?: boolean,
  title?: string,
  onClick: () => void
};

export function LogInButton ({ link, title = 'Sign in', onClick }: LogInButtonProps) {
  return <>
    <Button size={isMobile ? 'small' : 'default'} type={link ? 'link' : 'primary'} className={link ? 'DfBlackLink' : ''} onClick={onClick}>{title}</Button>
  </>;
}

type ModalProps = {
  open: boolean
  hide: () => void,
  warn?: string
};

const LogInModal = (props: ModalProps) => {
  const { open = false, hide, warn } = props;
  const [ currentAddress, setCurrentAddress ] = useState<string>()
  const isSignIn = useIsSignIn()

  return <Modal
    visible={open}
    title={<h3 style={{ fontWeight: 'bold' }}>{isSignIn ? 'Success' : `Sign in with Polkadot{.js} extension`}</h3>}
    footer={null}
    width={428}
    className='text-center'
    onCancel={hide}
  >
    <div className='p-4 pt-0'>
      {warn && <Alert
        message={warn}
        type="warning"
        closable={false}
      />}
      {currentAddress
        ? <>
          <div className='mb-4'>You have successfully signed in. Now you can:</div>
          <OnBoardingButton block />
        </>
        : <>
          <ChooseAccountFromExtension setCurrentAddress={(address) => setCurrentAddress(address)} />
          <Divider>or</Divider>
          <div className='mb-2'>Alternatively, you can create a new account right here on the site.</div>
          <Button block type='default' href='/bc/#/accounts' target='_blank' >
            <Avatar size={18} src='substrate.svg' />
            <span className='ml-2'>Create account</span>
          </Button>
        </>}
    </div>
  </Modal>;
};

export default LogInButton;
