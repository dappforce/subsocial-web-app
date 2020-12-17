import React from 'react'
import { useMyAddress } from './MyAccountContext'
import { MyAccountPopup } from '../profiles/address-views'
import { SignInButton } from './AuthButtons'
import { NewPostButtonInTopMenu } from '../posts/NewPostButtonInTopMenu'
import Link from 'next/link'
import { useNotifCounter } from '../utils/NotifCounter'
import { BellOutlined } from '@ant-design/icons'
import { Badge, Tooltip } from 'antd'
import { uiShowNotifications } from '../utils/env'

export const AuthorizationPanel = () => {
  const address = useMyAddress()
  const { unreadCount } = useNotifCounter()

  const renderNotificationsBadge = (unreadCount?: number) => {
    // if (!unreadCount || unreadCount <= 0) return null

    return <Badge count={unreadCount || 100} />
  }

  const notificationsItem = uiShowNotifications
    ? [ {
      name: 'My notifications',
      page: [ '/notifications', '/notifications' ],
      icon: <BellOutlined className='bell' />,
    } ]
    : []

  return <>
    {address
      ? <>
        <NewPostButtonInTopMenu />
        {
          <Link href={notificationsItem[0].page[0]} as={notificationsItem[0].page[1]}>
              <a className='DfNotificationCounter' >
                <Tooltip title={notificationsItem[0].name}>
                  {notificationsItem[0].icon}
                  {renderNotificationsBadge(unreadCount)}
                </Tooltip>
              </a>
          </Link>
        }
        <MyAccountPopup className='profileName' />
      </>
      : <SignInButton />
    }
  </>
}

export default AuthorizationPanel
