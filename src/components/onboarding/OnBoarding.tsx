import React from 'react'
import { Steps } from 'antd';
import { useAuth, StepsEnum } from '../auth/AuthContext';
import { SignInButton } from '../auth/AuthButtons';
import ButtonLink from '../utils/ButtonLink';
import { CreateSpaceButton } from '../spaces/helpers';
import { isMobileDevice } from 'src/config/Size.config';

const { Step } = Steps;

export type CurrentStep = {
  currentStep: StepsEnum
}

type Props = {
  direction?: 'horizontal' | 'vertical',
  size?: 'small' | 'default';
  progressDot?: boolean
}

const getMobilyFriendlyText = (text: string, mobileText?: string) => (isMobileDevice && mobileText) ? mobileText : text;

type StepItem = {
  title: string,
  key: string,
  content: string
}

type ActionButtonProps = {
  asLink?: boolean,
  block?: boolean,
  onlyStep?: StepsEnum
}

export const OnBoardingButton = (props: ActionButtonProps) => {
  const { asLink, block, onlyStep } = props
  const { state: { currentStep } } = useAuth()

  const step = onlyStep || currentStep

  const title = stepItems[step]?.title

  switch (step) {
    case StepsEnum.Login: return <SignInButton isPrimary />
    case StepsEnum.GetTokens: return <ButtonLink block={block} type={asLink ? 'link' : 'primary'} href='/faucet' as='/faucet'>{title}</ButtonLink>
    case StepsEnum.CreateSpace: return <CreateSpaceButton block={block} type={asLink ? 'link' : 'primary'} ghost={false}>{title}</CreateSpaceButton>
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
    title: getMobilyFriendlyText('Create my space', 'Create space'),
    key: 'spaces',
    content: 'Get first tokens'
  }
]

type ViewProps = Props & {
  currentStep: StepsEnum
}

export const OnBoardingView = ({ direction = 'vertical', size = 'default', progressDot, currentStep }: ViewProps) => {
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

export const OnBoarding = (props: Props) => {
  const { state: { currentStep } } = useAuth()
  return <OnBoardingView currentStep={currentStep} {...props} />
}
