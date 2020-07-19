import React from 'react';

import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import { Avatar, Divider, Alert } from 'antd';
import { OnBoardingButton } from '../onboarding';
import { ModalKind, useAuth, StepsEnum } from './AuthContext';
import { AccountSelector } from '../profile-selector/AccountSelector';
import PrivacyPolicyLinks from '../utils/PrivacyPolicyLinks';

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
  const { isSignIn = false, isTokens = false } = isSteps
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
        if (!isTokens) {
          content.title = 'Wait a sec...'
          content.body = <OnBoardingButton onlyStep={StepsEnum.GetTokens} />
          content.warn = 'You need some tokens to continue.'
          return content
        }
        return content;
      }
      case 'SwitchAccount': {
        content.title = 'Switch account'
        content.body = <AccountSelector />
        return content
      }
    }
  } else {
    content.body = <>
      <AccountSelector />
      <Divider className='m-0 mb-3' />
      <div className='px-3'>
        <div className='mb-3'>Alternatively, you can create a new account right here on the site.</div>
        <Button block type='default' href='/bc/#/accounts' target='_blank' >
          <Avatar size={18} src='substrate.svg' />
          <span className='ml-2'>Create account</span>
        </Button>
      </div>
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

type ModalViewProps = ModalProps & {
  isSteps: {
    isSignIn: boolean;
    isTokens: boolean;
    isSpaces: boolean;
  }
}

export const SignInModalView = ({ open, hide, kind, isSteps }: ModalViewProps) => {
  const { warn, body, title } = getModalContent(kind, isSteps)

  return title ? <Modal
    visible={open}
    title={ <h3 style={{ fontWeight: 'bold' }}>{title}</h3>}
    footer={null}
    width={325}
    className='text-center DfSignInModal'
    onCancel={hide}
  >
    <>
      {warn && <Alert
        className='mb-4'
        message={warn}
        type="warning"
        closable={false}
      />}
      {body}
      <Divider className='mt-3 m-0' />
      <PrivacyPolicyLinks />
    </>
  </Modal> : null;
}

export const SignInModal = (props: ModalProps) => {
  const { state: { isSteps } } = useAuth()

  return <SignInModalView isSteps={isSteps} {...props} />
};

export default SignInModal;
