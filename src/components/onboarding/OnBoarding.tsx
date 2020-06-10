import React from 'react'
import { Steps, Button } from 'antd';
import { useBoarding, StepsEnum } from './OnBoardingContex';
import { isMobile } from 'react-device-detect';
import { AuthorizationPanel } from 'src/components/utils/LogIn';

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
  asLink?: boolean,
  block?: boolean
}

export const OnBoardingButton = (props: ActionButtonProps) => {
  const { asLink, block } = props
  const { state: { currentStep } } = useBoarding()

  if (currentStep === StepsEnum.Disable) return null;

  const { title } = stepItems[currentStep]
  const buttons = [
    <AuthorizationPanel />,
    <Button block={block} type={asLink ? 'link' : 'primary'} href='/get-free-tokens'>{title}</Button>,
    <Button block={block} type={asLink ? 'link' : 'primary'} href='/spaces/new'>{title}</Button>
  ]

  return buttons[currentStep]
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

  const initialized = currentStep !== StepsEnum.Disable
  if (!showOnBoarding) return null;

  return <div className={`DfCard ${initialized && 'active'}`}>
    {onBoadingTitle}
    <OnBoarding direction='vertical' />
    <OnBoardingButton />
  </div>
}

export const OnBoardingMobileCard = () => {
  const { state: { currentStep, showOnBoarding } } = useBoarding()

  if (!showOnBoarding || currentStep === StepsEnum.Disable) return null;

  return <div className='DfMobileOnBoarding'>
    <span><b>Join Subsocial.</b> Step {currentStep + 1}/3</span>
    <OnBoardingButton />
  </div>
}
