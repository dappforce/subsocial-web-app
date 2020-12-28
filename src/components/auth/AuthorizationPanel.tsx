import React from 'react'
import { useMyAddress } from './MyAccountContext'
import { MyAccountPopup } from '../profiles/address-views'
import { SignInButton } from './AuthButtons'
import { NewPostButtonInTopMenu } from '../posts/NewPostButtonInTopMenu'
import { NotificationsCount } from '../activity/NotifCounter'

export const AuthorizationPanel = () => {
  const address = useMyAddress()

  return <>
  {address
    ? <>
      <NewPostButtonInTopMenu />
      <NotificationsCount />
      <MyAccountPopup className='profileName' />
    </>
    : <SignInButton />}
  </>
}

export default AuthorizationPanel
