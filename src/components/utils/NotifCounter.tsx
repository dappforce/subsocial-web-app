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
  const [ address, setAddress ] = useState<string | undefined>()

  if (myAddress) {
    setAddress(myAddress)
  }

  if (address !== myAddress) {
    setWsConnected(false)
    setAddress(myAddress)
  }

  useEffect(() => {

    const subscribe = async () => {
      if (wsConnected || !myAddress) return;

      const ws = new WebSocket(offchainWs)

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
    }

    subscribe()
  }, [ myAddress?.toString(), wsConnected ]);

  return (
    <NotifCounterContext.Provider value={contextValue}>
      {props.children}
    </NotifCounterContext.Provider>
  );
}

export const useNotifCounter = () => {
  return useContext(NotifCounterContext);
}
