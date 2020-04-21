import React from 'react'
import { Navigation } from '../../layout/Navigation'
export const Content: React.FunctionComponent = ({ children }) => {

  return <>
    <Navigation>
      {children}
    </Navigation>
  </>
}
