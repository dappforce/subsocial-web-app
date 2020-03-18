import React, { createContext, useContext, useState, useEffect } from 'react'
import { offchainWs } from './OffchainUtils'
import { useMyAccount } from './MyAccountContext';

export type NotifCounterContextProps = {
  unreadCount: number
}

export const NotifCounterContext = createContext<NotifCounterContextProps>({ unreadCount: 0 });

export const NotifCounterProvider = (props: React.PropsWithChildren<{}>) => {
  const { state: { address: myAddress } } = useMyAccount()

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

      ws.onopen = () => {
        console.log('Connected to Notifications Counter Web Socket')
        ws.send(myAddress?.toString());
        setWsConnected(true)
        ws.onmessage = (msg: MessageEvent) => {
          const unreadCount = msg.data
          setContextValue({ unreadCount })
          console.log('Received a new value for unread notifications:', unreadCount)
        }
        ws.onerror = (error) => { console.log('NotificationCounter Websocket Error:', error) }
      };

      ws.onclose = () => {
        setWsConnected(false)
      };
    }

    subscribe()

    return () => closeWs()
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
