import React from 'react'
import { OnBoarding, stepItems } from './OnBoarding';
import { useBoarding } from '.';
import { Button } from 'antd';
import HeadMeta from 'src/components/utils/HeadMeta';

type Props = {
  title?: string,
  onlyStep?: number
}

export const OnBoardingPage = ({
  title = 'Get started with Subsocial',
  onlyStep
}: Props) => {
  const { state: { currentStep } } = useBoarding()
  const step = onlyStep || currentStep
  const desc = stepItems[step].content
  return (
    <div className='DfOnBoardingPage'>
      <HeadMeta title={title} desc={desc} />
      <h1 className='d-flex justify-content-center'>{title}</h1>
      {!onlyStep && <OnBoarding direction='horizontal' />}
      <div className='DfCard mt-4'>{desc}</div>
      <div className="justify-content-center d-flex">
        <Button type='primary' href=''>{stepItems[step].title}</Button>
      </div>
    </div>
  );
}

export default OnBoardingPage;
