import React, { createContext, useContext, useState, useEffect } from 'react'
import { offchainWs } from './OffchainUtils'
import { useMyAccount } from './MyAccountContext';

export type NotifCounterContextProps = {
  unreadCount: number
}

export const NotifCounterContext = createContext<NotifCounterContextProps>({ unreadCount: 0 });

export const NotifCounterProvider = (props: React.PropsWithChildren<{}>) => {
  const [ contextValue, setContextValue ] = useState({ unreadCount: 0 })
  const [ wsConnected, setWsConnected ] = useState(false)
  const { state: { address: myAddress } } = useMyAccount()

  useEffect(() => {
    const subscribe = async () => {
      if (wsConnected || !myAddress) return;
      // open WebSocket connection to NotifCounter
      const ws = new WebSocket(offchainWs)
      // ? TODO new NotifCounterWS(account)
      ws.send(myAddress?.toString());
      setWsConnected(true)
      ws.onmessage = (msg: MessageEvent) => { setContextValue({ unreadCount: msg.data }) }
      ws.onerror = (error) => { console.log('Websocket Error:', error) }
    }

    subscribe()
  }, [ wsConnected ]);

  return (
    <NotifCounterContext.Provider value={contextValue}>
      {props.children}
    </NotifCounterContext.Provider>
  );
}

export const useNotifCounter = () => {
  return useContext(NotifCounterContext);
}
