import React from 'react'
import OnBoardingCard, { OnBoardingMobileCard } from '../onboarding'
import Section from '../utils/Section'
import { isBrowser } from 'react-device-detect'
import { Affix } from 'antd'
import { useAuth } from '../auth/AuthContext'

type Props = {
  leftPanel?: React.ReactNode,
  rightPanel?: React.ReactNode,
  withOnBoarding?: boolean,
  className?: string
}
export const PageContent: React.FunctionComponent<Props> = ({ leftPanel, rightPanel, withOnBoarding, className, children }) => {
  const { state: { showOnBoarding } } = useAuth()
  const rightContent = withOnBoarding && showOnBoarding ? <OnBoardingCard /> : rightPanel
  return isBrowser
    ? <div className='d-flex w-100'>
      {leftPanel && <div className='DfLeftPanel DfPanel'>{leftPanel}</div>}
      <Section className={`DfMainContent ${className}`}>{children}</Section>
      {rightContent && <div className='DfRightPanel DfPanel'>{rightContent}</div>}
    </div>
    : <>
      {children}
      {showOnBoarding && <Affix offsetBottom={5}><OnBoardingMobileCard /></Affix>}
    </>
}
