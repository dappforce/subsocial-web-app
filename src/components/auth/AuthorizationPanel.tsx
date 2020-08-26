import React from 'react';
import { useMyAddress } from './MyAccountContext';
import { MyAccountPopup } from '../profiles/address-views';
import { SignInButton } from './AuthButtons'

export const AuthorizationPanel = () => {
  const address = useMyAddress()
  return <>
    {address ? <MyAccountPopup
      className='profileName'
    /> : <SignInButton />}
  </>
}

export default AuthorizationPanel;
