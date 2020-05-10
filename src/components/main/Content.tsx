import React, { useContext } from 'react'
import { Navigation } from '../../layout/Navigation'
import { StatusContext } from '@subsocial/react-components';
import dynamic from 'next/dynamic';
const Status = dynamic(() => import('./Status'), { ssr: false });

export const Content: React.FunctionComponent = ({ children }) => {
  const { queueAction, stqueue, txqueue } = useContext(StatusContext);
  return <>
    <Status
      queueAction={queueAction as any}
      stqueue={stqueue}
      txqueue={txqueue}
    />
    <Navigation>
      {children}
    </Navigation>
  </>
}
