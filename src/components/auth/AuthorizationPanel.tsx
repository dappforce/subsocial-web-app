import React from 'react'
import { useMyAddress } from './MyAccountContext'
import { MyAccountPopup } from '../profiles/address-views'
import { SignInButton } from './AuthButtons'
import { NewPostButtonInTopMenu } from '../posts/NewPostButtonInTopMenu'
import { NotificationsCount, useNotifCounter } from '../activity/NotifCounter'

export const AuthorizationPanel = () => {
  const address = useMyAddress()
  const { unreadCount } = useNotifCounter()

  return <>
  {address
    ? <>
      <NewPostButtonInTopMenu />
      <NotificationsCount unreadCount={unreadCount} />
      <MyAccountPopup className='profileName' />
    </>
    : <SignInButton />}
  </>
}

export default AuthorizationPanel
