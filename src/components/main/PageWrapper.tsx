import React from 'react'
import { OnBoardingMobileCard } from '../onboarding'
import Section from '../utils/Section'
import { isBrowser } from 'src/config/Size.config';
import { Affix } from 'antd'
import { useAuth } from '../auth/AuthContext'

type Props = {
  leftPanel?: React.ReactNode,
  rightPanel?: React.ReactNode,
  className?: string
}
export const PageContent: React.FunctionComponent<Props> = ({ leftPanel, rightPanel, className, children }) => {
  const { state: { showOnBoarding } } = useAuth()
  const isPanels = leftPanel || rightPanel
  return isBrowser
    ? <div className='d-flex w-100'>
      {isPanels && <div className='DfLeftPanel DfPanel'>{leftPanel}</div>}
      <Section className={`DfMainContent ${className}`}>{children}</Section>
      {isPanels && <div className='DfRightPanel DfPanel'>{rightPanel}</div>}
    </div>
    : <>
      {children}
      {showOnBoarding && <Affix offsetBottom={5}><OnBoardingMobileCard /></Affix>}
    </>
}
