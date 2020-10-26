import React from 'react';
import { LatestSpaces } from '../components/main/LatestSpaces';
import { PageContent } from '../components/main/PageWrapper';
import { mockSpaceDataAlice, mockSpaceDataBob } from './mocks/SpaceMocks';
import { MockAuthProvider, StepsEnum, ModalKind } from '../components/auth/AuthContext';
import SignInModal from '../components/auth/SignInModal';

export default {
  title: 'Auth | SignInModal'
}

type Props = {
  kind: ModalKind
}

const MockSignInModal = ({ kind }: Props) => (
  <SignInModal open={true} hide={() => console.log('Mock hide')} kind={kind} />
)

export const _WaitSecSignIn = () => (
  <MockAuthProvider currentStep={StepsEnum.Login} completedSteps={ { isSignedIn: false } } {...{} as any}>
    <MockSignInModal kind='AuthRequired' />
  </MockAuthProvider>
)

export const _WaitSecGetTokens = () => (
  <MockAuthProvider currentStep={StepsEnum.Login} completedSteps={ { isSignedIn: true } } {...{} as any}>
    <MockSignInModal kind='AuthRequired' />
  </MockAuthProvider>
)

export const _SignIn = () => (
  <MockAuthProvider currentStep={StepsEnum.Login} completedSteps={ { isSignedIn: false } } {...{} as any}>
    <MockSignInModal kind='OnBoarding' />
  </MockAuthProvider>
)

export const _SwitchAccount = () => (
  <MockAuthProvider currentStep={StepsEnum.Login} completedSteps={ { isSignedIn: true } } {...{} as any}>
    <MockSignInModal kind='SwitchAccount' />
  </MockAuthProvider>
)
