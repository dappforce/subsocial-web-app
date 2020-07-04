import React from 'react'
import { OnBoardingMobileCard } from '../onboarding'
import Section from '../utils/Section'
import { isBrowser } from 'react-device-detect'
import { Affix } from 'antd'
import { useAuth } from '../auth/AuthContext'

type Props = {
  leftPanel?: React.ReactNode,
  rightPanel?: React.ReactNode,
  className?: string
}
export const PageContent: React.FunctionComponent<Props> = ({ leftPanel, rightPanel, className, children }) => {
  const { state: { showOnBoarding } } = useAuth()
  return isBrowser
    ? <div className='d-flex w-100'>
      {leftPanel && <div className='DfLeftPanel DfPanel'>{leftPanel}</div>}
      <Section className={`DfMainContent ${className}`}>{children}</Section>
      {rightPanel && <div className='DfRightPanel DfPanel'>{rightPanel}</div>}
    </div>
    : <>
      {children}
      {showOnBoarding && <Affix offsetBottom={5}><OnBoardingMobileCard /></Affix>}
    </>
}
