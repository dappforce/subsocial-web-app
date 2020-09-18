import React from 'react';
import Button, { ButtonSize, ButtonType } from 'antd/lib/button';
import { useAuth, ModalKind } from './AuthContext';
import { useMyAccount } from './MyAccountContext';
import { useSubsocialApi } from '../utils/SubsocialApiContext';

type InnerAuthButtonProps = {
  type?: ButtonType
  size?: ButtonSize
  title?: string
  className?: string
}

type OpenAuthButton = InnerAuthButtonProps & {
  kind: ModalKind
}

export function OpenAuthButton ({
  type = 'default',
  size,
  title = 'Click me',
  kind = 'OnBoarding',
  className
}: OpenAuthButton) {
  const { isApiReady } = useSubsocialApi()
  const { openSignInModal } = useAuth()

  return <Button
    size={size}
    className={className}
    disabled={!isApiReady}
    type={type}
    onClick={() => openSignInModal(kind)}
  >
    {title}
  </Button>
}

type SignInButtonProps = InnerAuthButtonProps & {
  isPrimary?: boolean
};

export const SignInButton = ({
  isPrimary,
  size,
  title = 'Sign in'
}: SignInButtonProps) => (
  <OpenAuthButton
    type={isPrimary ? 'primary' : 'default'}
    size={size}
    title={title}
    kind={'OnBoarding'}
  />
)

type SwitchAccountButtonProps = InnerAuthButtonProps

export const SwitchAccountButton = ({
  size,
  title = 'Switch account'
}: SwitchAccountButtonProps) => (
  <OpenAuthButton
    kind={'SwitchAccount'}
    type={'link'}
    size={size}
    title={title}
    className='DfButtonAsMenuItem'
  />
)

type SignOutButtonProps = InnerAuthButtonProps

export function SignOutButton ({
  size,
  title = 'Sign out'
}: SignOutButtonProps) {
  const { signOut } = useMyAccount()

  return <div className='mx-5'>
    <Button
      block
      size={size}
      onClick={signOut}
    >
      {title}
    </Button>
  </div>
}
