import React, { useContext } from 'react'
import { StatusContext } from '@polkadot/react-components'
import dynamic from 'next/dynamic'
import { Navigation } from '../../layout/Navigation'

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
