import React from 'react';

import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import { Avatar, Divider, Alert } from 'antd';
import { SignInFromExtension as SignInWithPolkadotExt } from './SignInWithPolkadotExt';
import { OnBoardingButton } from '../onboarding';
import { ModalKind, useAuth } from './AuthContext';
import { AccountSelector } from '../profile-selector/AccountSelector';

type IsSteps = {
  isSignIn: boolean,
  isTokens: boolean,
  isSpaces: boolean
}

type ModalProps = {
  open: boolean
  hide: () => void,
  kind: ModalKind
};

type ModalContent = {
  title: React.ReactNode,
  body: React.ReactNode,
  warn?: string
}

const getModalContent = (kind: ModalKind, isSteps: IsSteps) => {
  const { isSignIn, isTokens } = isSteps
  const content: ModalContent = {
    title: null,
    body: null
  }

  if (isSignIn) {
    switch (kind) {
      case 'OnBoarding': {
        content.title = <><span className='flipH'>🎉</span> Success <span>🎉</span></>

        content.body = <>
          <div className='mb-4'>You have successfully signed in. Now you can:</div>
          <OnBoardingButton />
        </>
        return content
      }
      case 'AuthRequired': {
        content.title = 'Wait a sec...'
        content.body = <OnBoardingButton />
        content.warn = !isTokens ? 'You need some tokens to continue.' : undefined
        return content
      }
      case 'ChangeAccount': {
        content.title = 'Change account'
        content.body = <AccountSelector />
        return content
      }
    }
  } else {
    content.body = <>
      <SignInWithPolkadotExt />
      <Divider>or</Divider>
      <div className='mb-4'>Alternatively, you can create a new account right here on the site.</div>
      <Button block type='default' href='/bc/#/accounts' target='_blank' >
        <Avatar size={18} src='substrate.svg' />
        <span className='ml-2'>Create account</span>
      </Button>
    </>

    switch (kind) {
      case 'OnBoarding': {
        content.title = `Sign in` // TODO maybe add ' with Polkadot{.js} extension' text
        return content
      }
      case 'AuthRequired': {
        content.title = 'Wait a sec...'
        content.warn = 'You need to sign in to access this functionality.'
        return content
      }
    }
    return content
  }

}

export const SignInModal = (props: ModalProps) => {
  const { open = false, hide, kind } = props;
  const { state: { isSteps } } = useAuth()
  const { warn, body, title } = getModalContent(kind, isSteps)

  return <Modal
    visible={open}
    title={ <h3 style={{ fontWeight: 'bold' }}>{title}</h3>}
    footer={null}
    width={428}
    className='text-center DfSignInModal'
    onCancel={hide}
  >
    <div className='p-4 pt-0'>
      {warn && <Alert
        className='mb-4'
        message={warn}
        type="warning"
        closable={false}
      />}
      {body}
    </div>
  </Modal>;
};

export default SignInModal;
