import React, { useState, createContext, useContext, useEffect } from 'react';
import { useIsSignIn, useMyAddress } from 'src/components/auth/MyAccountContext';
import useSubsocialEffect from '../api/useSubsocialEffect';
import store from 'store'
import SignInModal from './SignInModal';
import { useRouter } from 'next/router';

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
  const { asPath } = useRouter()

  const [ currentStep, setCurrentStep ] = useState(StepsEnum.Disabled)
  const address = useMyAddress()
  const [ onBoardedAccounts ] = useState<string[]>(store.get(ONBOARDED_ACCS) || [])

  const noOnBoarded = !address || !onBoardedAccounts.includes(address)
  const [ showOnBoarding, setShowOnBoarding ] = useState(noOnBoarded)
  const [ showModal, setShowModal ] = useState<boolean>(false);
  const [ kind, setKind ] = useState<ModalKind>()
  const [ isTokens, setTokens ] = useState(false)
  const [ isSpaces, setSpaces ] = useState(false)
  const isSignIn = useIsSignIn()

  useSubsocialEffect(({ substrate }) => {
    if (!isSignIn) {
      return setCurrentStep(0)
    }

    let unsubBalance: (() => void) | undefined
    let unsubSpace: (() => void) | undefined

    const subSpace = async (isBalanse: boolean) => {
      const api = await substrate.api
      unsubSpace = await api.query.spaces.spaceIdsByOwner(address, (data) => {
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
      })
    }

    let step = StepsEnum.Disabled;
    const subBalance = async () => {
      if (!address) return

      const api = await substrate.api
      unsubBalance = await api.derive.balances.all(address, (data) => {
        const balance = data.freeBalance.toString()
        const isEmptyBalanse = balance === '0'
        if (isEmptyBalanse) {
          setTokens(false)
          step = StepsEnum.GetTokens
        } else {
          setTokens(true)
        }
        subSpace(!isEmptyBalanse)
      });
    }

    subBalance();

    return () => {
      unsubSpace && unsubSpace()
      unsubBalance && unsubBalance()
    }
  }, [ currentStep, address, isSignIn ])

  useEffect(() => setShowModal(false), [ asPath ])

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
