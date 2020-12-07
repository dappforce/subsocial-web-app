import React, { createContext, useContext, useState, useEffect } from 'react'
import { offchainWs } from './env'
import { useMyAddress } from '../auth/MyAccountContext';
import { newLogger } from '@subsocial/utils';

export type NotifCounterContextProps = {
  unreadCount: number
}

export const NotifCounterContext = createContext<NotifCounterContextProps>({ unreadCount: 0 });

const log = newLogger(NotifCounterProvider.name)

export function NotifCounterProvider (props: React.PropsWithChildren<{}>) {
  const myAddress = useMyAddress()

  const [ contextValue, setContextValue ] = useState({ unreadCount: 0 })
  const [ wsConnected, setWsConnected ] = useState(false)
  const [ ws, setWs ] = useState<WebSocket>()
  const [ address, setAddress ] = useState(myAddress)

  const closeWs = () => {
    if (ws && !(ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED)) {
      ws.close()
    }
    setWsConnected(false)
  }

  if (address !== myAddress) {
    closeWs()
    setAddress(myAddress)
  }

  useEffect(() => {

    const subscribe = async () => {
      if (wsConnected || !myAddress || !offchainWs) return;

      const ws = new WebSocket(offchainWs)
      setWs(ws)

      // if(ws.OPEN) {
      //   ws.onmessage = (msg: MessageEvent) => {
      //     console.log("i`m alive")
      //     const unreadCount = msg.data
      //     setContextValue({ unreadCount })
      //     log.info('Received a new value for unread notifications:', unreadCount)
      //   }
      // }


      ws.onopen = () => {
        log.info('Connected to Notifications Counter Web Socket')
        ws.send(myAddress?.toString());
        setWsConnected(true)
        ws.onerror = (error) => { log.info('NotificationCounter Websocket Error:', error) }
      };

      ws.onclose = () => {
        setWsConnected(false)
      };

      ws.onmessage = (msg: MessageEvent) => {
        const unreadCount = msg.data
        setContextValue({ unreadCount })
        log.info('Received a new value for unread notifications:', unreadCount)
      }
    }


    subscribe()
  }, [ wsConnected, myAddress ]);

  return (
    <NotifCounterContext.Provider value={contextValue}>
      {props.children}
    </NotifCounterContext.Provider>
  );
}

export const useNotifCounter = () => {
  return useContext(NotifCounterContext);
}
