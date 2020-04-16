import React, { useContext } from 'react'
import { StatusContext } from '@polkadot/react-components'
import Status from './Status'
import { Navigation } from '../../layout/Navigation'

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
