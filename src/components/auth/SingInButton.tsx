import React from 'react';

import Button from 'antd/lib/button';
import { isMobile } from 'react-device-detect';
import { useAuth } from './AuthContext';

type SignInButtonProps = {
  size?: 'small' | 'default' | 'large',
  link?: boolean,
  title?: string
};

export function SignInButton ({
  link,
  size = isMobile ? 'small' : 'default',
  title = 'Sign in'
}: SignInButtonProps) {
  const { openSignInModal } = useAuth()
  return <>
    <Button
      size={size}
      type={link ? 'link' : 'primary'}
      className={link ? 'DfBlackLink' : ''}
      onClick={() => openSignInModal()}>{title}</Button>
  </>;
}

export default SignInButton;
