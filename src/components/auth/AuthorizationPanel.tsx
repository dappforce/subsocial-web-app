import React from 'react';
import { useMyAddress } from './MyAccountContext';
import { AddressPopupWithOwner } from '../profiles/address-views';
import { SignInButton } from './AuthButtons'

export const AuthorizationPanel = () => {
  const address = useMyAddress()
  return <>
    {address ? <AddressPopupWithOwner
      className='profileName'
      address={address}
    /> : <SignInButton />}
  </>
}
