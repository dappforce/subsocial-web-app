import React, { useContext } from 'react'
import { StatusContext } from '@polkadot/react-components'
import { Navigation } from '../../layout/Navigation'
import dynamic from 'next/dynamic'

const Status = dynamic(() => import('./Status'), { ssr: false });
export const Content: React.FunctionComponent = ({ children }) => {
  const { queueAction, stqueue, txqueue } = useContext(StatusContext);

  return <>
    <Status
      queueAction={queueAction}
      stqueue={stqueue}
      txqueue={txqueue}
    />
    <Navigation>
      {children}
    </Navigation>
  </>
}
