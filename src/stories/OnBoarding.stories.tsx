import React from 'react';
import { LatestSpaces } from '../components/main/LatestSpaces';
import { PageContent } from '../components/main/PageWrapper';
import { mockSpaceDataAlice, mockSpaceDataBob } from './mocks/SpaceMocks';
import { MockAuthProvider, StepsEnum } from '../components/auth/AuthContext';

export default {
  title: 'Auth | OnBoarding'
}

export const _OnBoaringCardDisable = () => (
  <MockAuthProvider currentStep={StepsEnum.Disabled} {...{} as any}>
    <PageContent withOnBoarding>
      <LatestSpaces spacesData={[ mockSpaceDataAlice, mockSpaceDataBob, mockSpaceDataAlice ]} />
    </PageContent>
  </MockAuthProvider>
)

export const _OnBoaringCardSignIn = () => (
  <MockAuthProvider currentStep={StepsEnum.Login} {...{} as any}>
    <PageContent withOnBoarding>
      <LatestSpaces spacesData={[ mockSpaceDataAlice, mockSpaceDataBob, mockSpaceDataAlice ]} />
    </PageContent>
  </MockAuthProvider>
)

export const _OnBoaringCardGetTokents = () => (
  <MockAuthProvider currentStep={StepsEnum.GetTokens} {...{} as any}>
    <PageContent withOnBoarding>
      <LatestSpaces spacesData={[ mockSpaceDataAlice, mockSpaceDataBob, mockSpaceDataAlice ]} />
    </PageContent>
  </MockAuthProvider>
)

export const _OnBoaringCardCreateSpace = () => (
  <MockAuthProvider currentStep={StepsEnum.CreateSpace} {...{} as any}>
    <PageContent withOnBoarding>
      <LatestSpaces spacesData={[ mockSpaceDataAlice, mockSpaceDataBob, mockSpaceDataAlice ]} />
    </PageContent>
  </MockAuthProvider>
)
