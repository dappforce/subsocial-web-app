import React from 'react'
import { Steps, Button } from 'antd';
import { useBoarding, StepsEnum } from './OnBoardingContex';
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
  content: string
}

type ActionButtonProps = {
  step: StepItem,
  index: number
  asLink?: boolean
}

const ActionButton = (props: ActionButtonProps) => {
  const { step: { title }, asLink, index } = props

  const buttons = [
    <LogInButton title={title} link={asLink} />,
    <Button type={asLink ? 'link' : 'primary'} href='/get-free-tokens'>{title}</Button>,
    <Button type={asLink ? 'link' : 'primary'} href='/spaces/new'>{title}</Button>
  ]

  return buttons[index]
}

export const stepItems: StepItem[] = [
  {
    title: getMobilyFriendlyText('Sign in'),
    key: 'login',
    content: 'Sign in'
  },
  {
    title: getMobilyFriendlyText('Get free tokens', 'Get tokens'),
    key: 'tokens',
    content: 'Get first tokens'
  },
  {
    title: getMobilyFriendlyText('Create your space', 'Create space'),
    key: 'spaces',
    content: 'Get first tokens'
  }
]

export const OnBoarding = ({ direction = 'vertical', size = 'default', progressDot }: Props) => {
  const { state: { currentStep } } = useBoarding()
  const steps = stepItems.map((step, index) =>
    <Step className='DfStep' disabled={currentStep !== index} key={step.key} title={step.title}/>)

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
  const { state: { currentStep, showOnBoarding } } = useBoarding()

  if (!showOnBoarding || currentStep >= StepsEnum.Finish) return null;

  return <div className='DfCard DfActiveBorder'>
    {onBoadingTitle}
    <OnBoarding direction='vertical' />
    <ActionButton step={stepItems[currentStep]} index={currentStep} />
  </div>
}

export const OnBoardingMobileCard = () => {
  const { state: { currentStep, showOnBoarding } } = useBoarding()

  if (!showOnBoarding || currentStep >= StepsEnum.Finish) return null;

  return <div className='DfMobileOnBoarding'>
    <span><b>Join Subsocial.</b> Step {currentStep + 1}/3</span>
    <ActionButton step={stepItems[currentStep]} index={currentStep} />
  </div>
}
