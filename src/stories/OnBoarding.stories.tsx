import React from 'react';
import { LatestSpaces } from '../components/main/LatestSpaces';
import { PageWithOnBoarding, PageWrapper } from '../components/main/PageWrapper';
import { mockSpaceDataAlice, mockSpaceDataBob } from './mocks/SpaceMocks';
import { OnBoardingPage, withBoardingContext } from '../components/docs/onboarding';

export default {
  title: 'OnBoarding | List'
}

export const _OnBoaringCard = () => (
  <PageWithOnBoarding>
    <LatestSpaces spacesData={[ mockSpaceDataAlice, mockSpaceDataBob, mockSpaceDataAlice ]} />
  </PageWithOnBoarding>
)

export const _OnBoardingPage = () => (
  <PageWrapper>
    {withBoardingContext(OnBoardingPage)}
  </PageWrapper>
)
