import React, { useState, createContext, useContext, useEffect } from 'react';
import { useIsSignIn, useMyAccount } from 'src/components/auth/MyAccountContext';
import { useApi } from '@subsocial/react-hooks';
import { useRouter } from 'next/router';
import store from 'store'
import SignInModal from './SignInModal';

const ONBOARDED_ACCS = 'df.onboarded'

export type AuthState = {
  currentStep: number,
  isSteps: {
    isSignIn: boolean,
    isTokens: boolean,
    isSpaces: boolean,
  }
  showOnBoarding: boolean
}

function functionStub () {
  throw new Error('Function needs to be set in OnBoardingContext')
}

export type ModalKind = 'OnBoarding' | 'AuthRequired' | 'SwitchAccount'

export type AuthContextProps = {
  state: AuthState,
  openSignInModal: (kind?: ModalKind) => void,
  hideSignInModal: () => void,
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
}

const contextStub: AuthContextProps = {
  state: {
    currentStep: 0,
    isSteps: {
      isSignIn: false,
      isSpaces: false,
      isTokens: false
    },
    showOnBoarding: false
  },
  openSignInModal: functionStub,
  hideSignInModal: functionStub,
  setCurrentStep: functionStub
}

export enum StepsEnum {
  Disabled = -1,
  Login,
  GetTokens,
  CreateSpace
}

export const AuthContext = createContext<AuthContextProps>(contextStub)

export function AuthProvider (props: React.PropsWithChildren<any>) {
  const [ currentStep, setCurrentStep ] = useState(StepsEnum.Disabled)
  const { state: { address } } = useMyAccount()
  const [ onBoardedAccounts ] = useState<string[]>(store.get(ONBOARDED_ACCS) || [])

  const noOnBoarded = !address || !onBoardedAccounts.includes(address)
  const [ showOnBoarding, setShowOnBoarding ] = useState(noOnBoarded)
  const [ showModal, setShowModal ] = useState<boolean>(false);
  const [ kind, setKind ] = useState<ModalKind>()
  const [ isTokens, setTokens ] = useState(false)
  const [ isSpaces, setSpaces ] = useState(false)
  const { api, isApiReady } = useApi()
  const isSignIn = useIsSignIn()

  useEffect(() => {
    let unsubBalance: (() => void) | undefined
    let unsubBlog: (() => void) | undefined

    if (!isApiReady) return setCurrentStep(StepsEnum.Disabled);

    if (!isSignIn) {
      return setCurrentStep(0)
    }

    const subBlog = async (isBalanse: boolean) => {
      unsubBlog = await api.query.spaces.spaceIdsByOwner(address, (data) => {
        if (data.isEmpty) {
          setSpaces(false)
          if (isBalanse) {
            step = StepsEnum.CreateSpace
          }
        } else if (step === StepsEnum.Disabled) {
          setSpaces(true)
          setShowModal(false)
          noOnBoarded && store.set(ONBOARDED_ACCS, address)
        }

        setShowOnBoarding(step !== StepsEnum.Disabled)
        setCurrentStep(step)
      });
    }

    let step = StepsEnum.Disabled;
    const subBalance = async () => {
      console.log(api.query.system)
      if (!address) return
      unsubBalance = await api.derive.balances.all(address, (data) => {
        const balanse = data.freeBalance.toString()
        const isEmptyBalanse = balanse === '0'
        if (isEmptyBalanse) {
          setTokens(false)
          step = StepsEnum.GetTokens
        } else {
          setTokens(true)
        }
        subBlog(!isEmptyBalanse)
      });
    }

    subBalance();

    return () => {
      unsubBlog && unsubBlog()
      unsubBalance && unsubBalance()
    }
  }, [ currentStep, address, isApiReady, isSignIn ])

  console.log(useRouter().pathname)
  const contextValue = {
    state: {
      showOnBoarding: showOnBoarding,
      currentStep,
      isSteps: {
        isSignIn,
        isTokens,
        isSpaces
      }
    },
    openSignInModal: (kind?: ModalKind) => {
      setKind(kind || 'OnBoarding')
      setShowModal(true)
    },
    hideSignInModal: () => {
      address && setShowModal(false)
    },
    setCurrentStep
  }

  return <AuthContext.Provider value={contextValue}>
    {props.children}
    {kind && <SignInModal open={showModal} kind={kind} hide={() => setShowModal(false)} />}
  </AuthContext.Provider>
}

export function useAuth () {
  return useContext(AuthContext)
}

export function MockAuthProvider (props: React.PropsWithChildren<AuthState>) {
  return <AuthContext.Provider value={{ ...contextStub, state: { ...props, showOnBoarding: true } }}>
    {props.children}
  </AuthContext.Provider>
}

export function withAuthContext (Component: React.ComponentType<any>) {
  return <AuthProvider><Component/></AuthProvider>
}
