import React from 'react'
import { useMyAddress } from './MyAccountContext'
import { MyAccountPopup } from '../profiles/address-views'
import { SignInButton } from './AuthButtons'
import { NewPostButtonInTopMenu } from '../posts/NewPostButtonInTopMenu'

export const AuthorizationPanel = () => {
  const address = useMyAddress()
  return <>
    {address
      ? <>
        <NewPostButtonInTopMenu />
        <MyAccountPopup className='profileName' />
      </>
      : <SignInButton />
    }
  </>
}

export default AuthorizationPanel
