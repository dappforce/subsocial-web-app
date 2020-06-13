import React from 'react';

import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import { Avatar, Divider, Alert } from 'antd';
import { SignInFromExtension } from './SignInFromExtension';
import { OnBoardingButton } from '../onboarding';
import { useIsSignIn } from './MyAccountContext';

type ModalProps = {
  open: boolean
  hide: () => void,
  warn?: string
};

export const SignInModal = (props: ModalProps) => {
  const { open = false, hide, warn } = props;
  const isSignIn = useIsSignIn()

  return <Modal
    visible={open}
    title={<h3 style={{ fontWeight: 'bold' }}>
      {isSignIn
        ? <><span className='flipH'>🎉</span> Success <span>🎉</span></>
        : `Sign in with Polkadot{.js} extension`}</h3>}
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
      {isSignIn
        ? <>
          <div className='mb-4'>You have successfully signed in. Now you can:</div>
          <OnBoardingButton />
        </>
        : <>
          <SignInFromExtension />
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

export default SignInModal;
