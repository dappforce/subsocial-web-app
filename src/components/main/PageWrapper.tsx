import React from 'react'
import Section from '../utils/Section'
import { useResponsiveSize } from '../responsive'

type Props = {
  leftPanel?: React.ReactNode,
  rightPanel?: React.ReactNode,
  className?: string
}
export const PageContent: React.FunctionComponent<Props> = ({ leftPanel, rightPanel, className, children }) => {
  const { isNotMobile } = useResponsiveSize()
  const isPanels = leftPanel || rightPanel
  return isNotMobile
    ? <div className='d-flex w-100'>
      {isPanels && <div className='DfLeftPanel DfPanel'>{leftPanel}</div>}
      <Section className={`DfMainContent ${className}`}>{children}</Section>
      {isPanels && <div className='DfRightPanel DfPanel'>{rightPanel}</div>}
    </div>
    : <>
      {children}
      {/* {showOnBoarding && <Affix offsetBottom={5}><OnBoardingMobileCard /></Affix>} */}
    </>
}
