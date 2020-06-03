import React from 'react'
import OnBoardingCard, { OnBoardingMobileCard, useBoarding } from '../docs/onboarding'
import Section from '../utils/Section'
import { isBrowser } from 'react-device-detect'
import { Affix } from 'antd'

type Props = {
  leftPanel?: React.ReactNode,
  rightPanel?: React.ReactNode
}
export const PageWrapper: React.FunctionComponent<Props> = ({ leftPanel, rightPanel, children }) => (
  <div className='d-flex'>
    {isBrowser && <div className='DfLeftPanel DfPanel'>{leftPanel}</div>}
    <Section className='DfMainContent'>{children}</Section>
    {isBrowser && <div className='DfRightPanel DfPanel'>{rightPanel}</div>}
  </div>
)

export const PageWithOnBoarding: React.FunctionComponent<Props> = ({ leftPanel, rightPanel, children }) => {
  const { state: { showOnBoarding } } = useBoarding()
  return isBrowser
    ? <PageWrapper
      leftPanel={leftPanel}
      rightPanel={showOnBoarding ? <OnBoardingCard /> : rightPanel}
    >
      {children}
    </PageWrapper>
    : <>
      <PageWrapper>{children}</PageWrapper>
      {showOnBoarding && <Affix offsetBottom={5}><OnBoardingMobileCard /></Affix>}
    </>
}
