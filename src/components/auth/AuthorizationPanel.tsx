import React from 'react';

import { useMyAccount } from './MyAccountContext';
import { AddressPopupWithOwner } from '../profiles/address-views';
import { SignInButton } from './AuthButtons'

export const AuthorizationPanel = () => {
  const { state: { address } } = useMyAccount()
  return <>
    {address ? <AddressPopupWithOwner
      className='profileName'
      address={address}
    /> : <SignInButton />}
  </>
}
