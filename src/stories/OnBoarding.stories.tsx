import React from 'react';
import { PageContent } from '../components/main/PageWrapper';
import { MockAuthProvider, StepsEnum } from '../components/auth/AuthContext';
import { OnBoardingCard } from '../components/onboarding'

export default {
  title: 'Auth | OnBoarding'
}

export const _OnBoaringCardDisable = () => (
  <MockAuthProvider currentStep={StepsEnum.Disabled} {...{} as any}>
    <PageContent>
      <OnBoardingCard />
    </PageContent>
  </MockAuthProvider>
)

export const _OnBoaringCardSignIn = () => (
  <MockAuthProvider currentStep={StepsEnum.Login} {...{} as any}>
    <PageContent>
      <OnBoardingCard />
    </PageContent>
  </MockAuthProvider>
)

export const _OnBoaringCardGetTokents = () => (
  <MockAuthProvider currentStep={StepsEnum.GetTokens} {...{} as any}>
    <PageContent>
      <OnBoardingCard />
    </PageContent>
  </MockAuthProvider>
)

export const _OnBoaringCardCreateSpace = () => (
  <MockAuthProvider currentStep={StepsEnum.CreateSpace} {...{} as any}>
    <PageContent>
      <OnBoardingCard />
    </PageContent>
  </MockAuthProvider>
)
