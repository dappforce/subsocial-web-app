import React from 'react'
import { Steps, Button } from 'antd';
import { useBoarding } from './OnBoardingContex';
import { isMobile } from 'react-device-detect';

const { Step } = Steps;

type Props = {
  direction?: 'horizontal' | 'vertical',
  size?: 'small' | 'default';
  progressDot?: boolean
}

const getMobilyFriendlyText = (text: string, mobileText?: string) => (isMobile && mobileText) ? mobileText : text;

export const stepsContent = [
  { title: getMobilyFriendlyText('Sign in'), key: 'login', content: 'Sign in' },
  { title: getMobilyFriendlyText('Get free tokens', 'Get tokens'), key: 'tokens', content: 'Get first tokens' },
  { title: getMobilyFriendlyText('Create your space', 'Create space'), key: 'spaces', content: 'Get first tokens' }
]

export const OnBoarding = ({ direction = 'vertical', size = 'default', progressDot }: Props) => {
  const { state: { currentStep } } = useBoarding()
  const steps = stepsContent.map((step) => <Step key={step.key} title={step.title}/>)

  return (
    <div>
      <Steps
        progressDot={progressDot}
        current={currentStep}
        size={size}
        direction={direction}
      >
        {steps}
      </Steps>
    </div>
  );
}

const onBoadingTitle = <h3 className='mb-3'>Get started with Subsocial</h3>

export const OnBoardingCard = () => {
  const { state: { currentStep } } = useBoarding()
  return <div className='DfCard'>
    {onBoadingTitle}
    <OnBoarding direction='vertical' />
    <Button type='primary' href='/get-started'>{stepsContent[currentStep].title}</Button>
  </div>
}

export const OnBoardingMobileCard = () => {
  const { state: { currentStep, showOnBoarding } } = useBoarding()

  if (!showOnBoarding) return null;

  return <div className='DfMobileOnBoarding'>
    <div>
      {onBoadingTitle}
      <OnBoarding direction='horizontal' size='small' progressDot/>
    </div>
    <Button type='primary' href='/get-started'>{stepsContent[currentStep].title}</Button>
  </div>
}
