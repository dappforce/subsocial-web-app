import React from 'react'
import { Steps, Button } from 'antd';
import { useBoarding } from './OnBoardingContex';
import { isMobile } from 'react-device-detect';
import { LogInButton } from 'src/components/utils/LogIn';

const { Step } = Steps;

type Props = {
  direction?: 'horizontal' | 'vertical',
  size?: 'small' | 'default';
  progressDot?: boolean
}

const getMobilyFriendlyText = (text: string, mobileText?: string) => (isMobile && mobileText) ? mobileText : text;

type StepItem = {
  title: string,
  key: string,
  content: string,
  actionButton: (title: string) => JSX.Element
}

export const stepItems: StepItem[] = [
  {
    title: getMobilyFriendlyText('Sign in'),
    key: 'login',
    content: 'Sign in',
    actionButton: (title: string) => <LogInButton title={title} />
  },
  {
    title: getMobilyFriendlyText('Get free tokens', 'Get tokens'),
    key: 'tokens',
    content: 'Get first tokens',
    actionButton: (title: string) => <Button type='primary' href='/get-free-tokens'>{title}</Button>
  },
  {
    title: getMobilyFriendlyText('Create your space', 'Create space'),
    key: 'spaces',
    content: 'Get first tokens',
    actionButton: (title: string) => <Button type='primary' href='/spaces/new'>{title}</Button>
  }
]

export const OnBoarding = ({ direction = 'vertical', size = 'default', progressDot }: Props) => {
  const { state: { currentStep } } = useBoarding()
  const steps = stepItems.map((step) => <Step key={step.key} title={step.title}/>)

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
const renderActionButton = (stepItem: StepItem) => stepItem.actionButton(stepItem.title)
export const OnBoardingCard = () => {
  const { state: { currentStep } } = useBoarding()
  return <div className='DfCard'>
    {onBoadingTitle}
    <OnBoarding direction='vertical' />
    {renderActionButton(stepItems[currentStep])}
  </div>
}

export const OnBoardingMobileCard = () => {
  const { state: { currentStep, showOnBoarding } } = useBoarding()

  if (!showOnBoarding) return null;

  return <div className='DfMobileOnBoarding'>
    <span><b>Join Subsocial.</b> Step {currentStep + 1}/3</span>
    {renderActionButton(stepItems[currentStep])}
  </div>
}
