import React from 'react';

import Button from 'antd/lib/button';
import { isMobile } from 'react-device-detect';
import { useAuth } from './AuthContext';
import { useMyAccount } from './MyAccountContext';
import { useApi } from '@subsocial/react-hooks';

type InnerAuthButtonProps = {
  size?: 'small' | 'default' | 'large',
  title?: string
}

type SignInButtonProps = InnerAuthButtonProps & {
  isPrimary?: boolean
};

export function SignInButton ({
  isPrimary = false,
  size = isMobile ? 'small' : 'default',
  title = 'Sign in'
}: SignInButtonProps) {
  const { isApiReady } = useApi()
  const { openSignInModal } = useAuth()
  return <Button
    size={size}
    disabled={!isApiReady}
    type={isPrimary ? 'primary' : 'default'}
    onClick={() => openSignInModal()}>
    {title}
  </Button>;
}

type SignOutButtonProps = InnerAuthButtonProps & {

};

export function SignOutButton ({
  size = isMobile ? 'small' : 'default',
  title = 'Sign out'
}: SignOutButtonProps) {
  const { signOut } = useMyAccount()
  return <div className='m-3'>
    <Button
      block
      size={size}
      onClick={() => signOut()}>
      {title}
    </Button>
  </div>
}
