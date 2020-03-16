import React, { createContext, useContext, useState, useEffect } from 'react'
import { offchainWs } from './OffchainUtils'
import { useMyAccount, checkIfLoggedIn } from './MyAccountContext';

export type NotifCounterContextProps = {
  unreadCount: number
}

export const NotifCounterContext = createContext<NotifCounterContextProps>({ unreadCount: 0 });

export const NotifCounterProvider = (props: React.PropsWithChildren<{}>) => {
  const [ contextValue, setContextValue ] = useState({ unreadCount: 0 })
  const [ wsConnected, setWsConnected ] = useState(false)
  const [ isLoggedIn, setIsLoggedIn ] = useState(false)
  const { state: { address: myAddress } } = useMyAccount()
  if (checkIfLoggedIn() && !isLoggedIn) setIsLoggedIn(true);

  useEffect(() => {
    const subscribe = async () => {
      if (wsConnected || !myAddress) return;

      const ws = new WebSocket(offchainWs)

      ws.onopen = () => {
        console.log('WS connected (NotificationCounter useEffect)')
        ws.send(myAddress?.toString());
        setWsConnected(true)
        ws.onmessage = (msg: MessageEvent) => {
          setContextValue({ unreadCount: msg.data })
          console.log(msg, 'msg from Effect')
        }
        ws.onerror = (error) => { console.log('NotificationCounter Websocket Error:', error) }
      };
    }

    subscribe()
  }, [ isLoggedIn, wsConnected ]);

  return (
    <NotifCounterContext.Provider value={contextValue}>
      {props.children}
    </NotifCounterContext.Provider>
  );
}

export const useNotifCounter = () => {
  return useContext(NotifCounterContext);
}
