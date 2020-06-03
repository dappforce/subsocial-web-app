import React, { useContext } from 'react'
import { Navigation } from '../../layout/Navigation'
import { Status, StatusContext } from '@subsocial/react-components';
import { OnBoardingProvider } from '../docs/onboarding';

export const Content: React.FunctionComponent = ({ children }) => {
  const { stqueue, txqueue } = useContext(StatusContext);
  return <>
    <Status
      stqueue={stqueue}
      txqueue={txqueue}
    />
    <OnBoardingProvider>
      <Navigation>
        {children}
      </Navigation>
    </OnBoardingProvider>
  </>
}
