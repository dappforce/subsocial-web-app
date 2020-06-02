import React from 'react'
import { Steps, Button } from 'antd';
import { useBoarding } from './OnBoardingContex';
import Link from 'next/link';
import { isMobile } from 'react-device-detect';
import { MutedDiv } from 'src/components/utils/MutedText';
import Section from 'src/components/utils/Section';

const { Step } = Steps;

type Props = {
  direction?: 'horizontal' | 'vertical',
}

const getMobilyFriendlyText = (text: string, mobileText?: string) => (isMobile && mobileText) ? mobileText : text;

const StepsTitle = [
  { title: getMobilyFriendlyText('Sign in'), link: 'login' },
  { title: getMobilyFriendlyText('Get first tokens', 'Get tokens'), link: 'tokens' },
  { title: getMobilyFriendlyText('Create first space', 'Create space'), link: 'spaces' },
  { title: getMobilyFriendlyText('Write first post', 'Write post'), link: 'posts' }
]

export const OnBoarding = ({ direction }: Props) => {
  const { state: { currentStep } } = useBoarding()
  const steps = new Array(4).fill(0).map((_, i) =>
    <Step
      title={<Link href={`/start/${StepsTitle[i].link}`}
      >
        <a className='DfBlackLink'>
          {StepsTitle[i].title}
        </a>
      </Link>}
      disabled={true}
    />)

  return (
    <div>
      <Steps
        current={currentStep}
        size={isMobile ? 'small' : 'default'}
        direction={isMobile ? 'horizontal' : 'vertical'}
      >
        {steps}
      </Steps>
    </div>
  );
}

const onBoadingTitle = <h3 className='mb-3'>Getting started with Subsocial</h3>

export const OnBoardingCard = () => {
  const { state: { currentStep } } = useBoarding()
  return <div className='DfCard'>
    {onBoadingTitle}
    <OnBoarding />
    <Button type='primary' href='/start'>{StepsTitle[currentStep].title}</Button>
  </div>
}

export const OnBoardingMobileCard = () => {
  const { state: { currentStep } } = useBoarding()
  return <div className='d-flex align-items-center DfMobileOnBoarding'>
    <div className='w-75'>
      {onBoadingTitle}
      <MutedDiv>{`Step ${currentStep + 1}/4: ${StepsTitle[currentStep].title}`}</MutedDiv>
    </div>
    <Button type='primary' className='w-25' href='/start'>{StepsTitle[currentStep].title}</Button>
  </div>
}
