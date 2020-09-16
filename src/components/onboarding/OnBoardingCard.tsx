import React from 'react'
import { useAuth, StepsEnum } from '../auth/AuthContext';
import { OnBoarding, OnBoardingButton, CurrentStep } from '.';

const onBoadingTitle = <h3 className='mb-3'>Get started with Subsocial</h3>

type OnBoardingCardViewProps = {
  initialized?: boolean
}

export const OnBoardingCardView = ({ initialized }: OnBoardingCardViewProps) => (
  <div className={`DfCard ${initialized && 'active'}`}>
    {onBoadingTitle}
    <OnBoarding direction='vertical' />
    <OnBoardingButton />
  </div>
)

export const OnBoardingCard = () => {
  const { state: { currentStep, showOnBoarding } } = useAuth()

  const initialized = currentStep !== StepsEnum.Disabled
  if (!showOnBoarding) return null;

  return <OnBoardingCardView initialized={initialized} />
}

type OnBoardingMobileCardViewProps = CurrentStep

export const OnBoardingMobileCardView = ({ currentStep }: OnBoardingMobileCardViewProps) => (
  <div className='DfMobileOnBoarding'>
    <span><b>Join Subsocial.</b> Step {currentStep + 1}/3</span>
    <OnBoardingButton />
  </div>
)

export const OnBoardingMobileCard = () => {
  const { state: { currentStep, showOnBoarding } } = useAuth()

  if (!showOnBoarding || currentStep === StepsEnum.Disabled) return null;

  return <OnBoardingMobileCardView currentStep={currentStep} />
}
