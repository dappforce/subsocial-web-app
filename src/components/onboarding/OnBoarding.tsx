import React from 'react'
import { Steps, Button } from 'antd';
import { useAuth, StepsEnum } from '../auth/AuthContext';
import { isMobile } from 'react-device-detect';
import { SignInButton } from '../auth/SingInButton';

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
  const { state: { currentStep } } = useAuth()

  const title = stepItems[currentStep]?.title

  console.log('New current step: ', title, currentStep)

  switch (currentStep) {
    case StepsEnum.Login: return <SignInButton isPrimary />
    case StepsEnum.GetTokens: return <Button block={block} type={asLink ? 'link' : 'primary'} href='/get-free-tokens'>{title}</Button>
    case StepsEnum.CreateSpace: return <Button block={block} type={asLink ? 'link' : 'primary'} href='/spaces/new'>{title}</Button>
    default: return null
  }

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
  const { state: { currentStep } } = useAuth()
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
  const { state: { currentStep, showOnBoarding } } = useAuth()

  const initialized = currentStep !== StepsEnum.Disabled
  if (!showOnBoarding) return null;

  return <div className={`DfCard ${initialized && 'active'}`}>
    {onBoadingTitle}
    <OnBoarding direction='vertical' />
    <OnBoardingButton />
  </div>
}

export const OnBoardingMobileCard = () => {
  const { state: { currentStep, showOnBoarding } } = useAuth()

  if (!showOnBoarding || currentStep === StepsEnum.Disabled) return null;

  return <div className='DfMobileOnBoarding'>
    <span><b>Join Subsocial.</b> Step {currentStep + 1}/3</span>
    <OnBoardingButton />
  </div>
}
