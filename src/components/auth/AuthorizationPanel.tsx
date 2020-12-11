import React from 'react'
import { useMyAddress } from './MyAccountContext'
import { MyAccountPopup } from '../profiles/address-views'
import { SignInButton } from './AuthButtons'
import { NewPostButtonInTopMenu } from '../posts/NewPostButtonInTopMenu'
import Link from 'next/link';
import { useNotifCounter } from '../utils/NotifCounter';
import { BellOutlined } from '@ant-design/icons';
import uiShowNotifications from '../../pages/notifications';
import { Badge, Tooltip } from 'antd';

export const AuthorizationPanel = () => {
  const address = useMyAddress()
  const { unreadCount } = useNotifCounter()

  const renderNotificationsBadge = (unreadCount?: number) => {
    if (!unreadCount || unreadCount <= 0) return null

    return <Badge count={unreadCount} />
  }

  const notificationsItem = uiShowNotifications
    ? [{
      name: 'My notifications',
      page: ['/notifications', '/notifications'],
      icon: <BellOutlined className='bell' />,
    }]
    : []

  return <>
    {address
      ? <>
        <NewPostButtonInTopMenu />
        {
          <Link href={notificationsItem[0].page[0]} as={notificationsItem[0].page[1]}>
            <Tooltip title={notificationsItem[0].name}>
              <a className='notifications' >
                {notificationsItem[0].icon}
                {renderNotificationsBadge(unreadCount)}
              </a>
            </Tooltip>
          </Link>
        }
        <MyAccountPopup className='profileName' />
      </>
      : <SignInButton />
    }
  </>
}

export default AuthorizationPanel
