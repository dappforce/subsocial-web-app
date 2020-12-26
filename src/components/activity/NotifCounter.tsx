import React, { createContext, useContext, useState, useEffect } from 'react'
import { offchainWs, uiShowNotifications } from '../utils/env'
import { useMyAddress } from '../auth/MyAccountContext'
import { newLogger } from '@subsocial/utils'
import { w3cwebsocket as W3CWebSocket, IMessageEvent } from 'websocket'
import { BellOutlined } from '@ant-design/icons'
import { Badge, Tooltip } from 'antd'
import Link from 'next/link'

export type NotifCounterContextProps = {
  unreadCount: number
}

export const NotifCounterContext = createContext<NotifCounterContextProps>({
  unreadCount: 0
})

const log = newLogger(NotifCounterProvider.name)

export let socket: W3CWebSocket

export const resloveWebSocketConnection = () => {
  if (!socket) {
    socket = new W3CWebSocket(offchainWs)
  }
  return socket
}

export function NotifCounterProvider (props: React.PropsWithChildren<{}>) {
  const myAddress = useMyAddress()

  const [ contextValue, setContextValue ] = useState({ unreadCount: 0 })
  const [ wsConnected, setWsConnected ] = useState(false)
  const [ ws, setWs ] = useState<W3CWebSocket>()
  const [ address, setAddress ] = useState(myAddress)

  const closeWs = () => {
    if (
      ws &&
      !(
        ws.readyState === WebSocket.CLOSING ||
        ws.readyState === WebSocket.CLOSED
      )
    ) {
      ws.close()
    }
    setWsConnected(false)
  }

  if (address !== myAddress) {
    closeWs()
    setAddress(myAddress)
  }

  useEffect(() => {
    if (wsConnected || !myAddress || !offchainWs) return

    resloveWebSocketConnection()
    setWs(socket)

    socket.onopen = () => {
      log.info('Connected to Notifications Counter Web Socket')
      socket.send(myAddress?.toString())
      setWsConnected(true)
      socket.onerror = error => {
        log.error('NotificationCounter Websocket Error:', error)
      }
    }

    socket.onclose = () => {
      setWsConnected(false)
    }
    socket.onmessage = (msg: IMessageEvent) => {
      const unreadCount = msg.data
      setContextValue({ unreadCount: parseInt(unreadCount.toString()) })
      log.info('Received a new value for unread notifications:', unreadCount)
    }
  }, [ wsConnected, myAddress ])

  return (
    <NotifCounterContext.Provider value={contextValue}>
      {props.children}
    </NotifCounterContext.Provider>
  )
}

export const useNotifCounter = () => {
  return useContext(NotifCounterContext)
}

const notificationItem = {
  name: 'My notifications',
  page: [ '/notifications', '/notifications' ],
  icon: <BellOutlined className="bell" />
}

type NotificationsProps = {
  unreadCount: number
}

const NotificationsBadge = ({ unreadCount }: NotificationsProps) => {
  if (!unreadCount || unreadCount <= 0) return null

  return <Badge count={unreadCount} />
}

export const NotificationsCount = (props: NotificationsProps) => {
  if (!uiShowNotifications) return null

  return (
    <Link href={notificationItem.page[0]} as={notificationItem.page[1]}>
      <a className="DfNotificationsCounter">
        <Tooltip title={notificationItem.name}>
          {notificationItem.icon}
          {<NotificationsBadge {...props} />}
        </Tooltip>
      </a>
    </Link>
  )
}
