import React from 'react'
import { OnBoarding, stepItems } from './OnBoarding';
import { useAuth } from '../auth/AuthContext';
import { Button } from 'antd';
import HeadMeta from 'src/components/utils/HeadMeta';
import { PageContent } from '../main/PageWrapper';

type Props = {
  title?: string,
  onlyStep?: number
}

export const OnBoardingPage = ({
  title = 'Get started with Subsocial',
  onlyStep
}: Props) => {
  const { state: { currentStep } } = useAuth()
  const step = onlyStep || currentStep
  const desc = stepItems[step].content
  return (
    <PageContent>
      <div className='DfOnBoardingPage'>
        <HeadMeta title={title} desc={desc} />
        <h1 className='d-flex justify-content-center'>{title}</h1>
        {!onlyStep && <OnBoarding direction='horizontal' />}
        <div className='DfCard mt-4'>
          {desc}
          <div className="justify-content-center d-flex">
            <Button type='primary' href=''>{stepItems[step].title}</Button>
          </div>
        </div>
      </div>
    </PageContent>
  );
}

export default OnBoardingPage;
