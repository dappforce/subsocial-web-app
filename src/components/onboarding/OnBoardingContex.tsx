import React, { useState, createContext, useContext, useEffect } from 'react';
import { useIsSignIn, useMyAccount } from 'src/components/auth/MyAccountContext';
import { useApi } from '@subsocial/react-hooks';
import { useRouter } from 'next/router';
import store from 'store'

const KEY = 'df.onboarded'

export type OnBoardingState = {
  currentStep: number,
  actions: boolean,
  showOnBoarding: boolean
}

function functionStub () {
  throw new Error('Function needs to be set in OnBoardingContext')
}

export type OnBoardingContextProps = {
  state: OnBoardingState
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>,
  setAction: React.Dispatch<React.SetStateAction<boolean>>
}

const contextStub: OnBoardingContextProps = {
  state: {
    currentStep: 0,
    actions: false,
    showOnBoarding: false
  },
  setCurrentStep: functionStub,
  setAction: functionStub
}

export enum StepsEnum {
  Disable = -1,
  Login,
  GetTokens,
  CreateSpace
}

export const OnBoardingContext = createContext<OnBoardingContextProps>(contextStub)

export function OnBoardingProvider (props: React.PropsWithChildren<any>) {
  const [ currentStep, setCurrentStep ] = useState(StepsEnum.Disable)
  const { state: { address } } = useMyAccount()
  const [ onBoardedAccounts ] = useState<string[]>(store.get(KEY) || [])

  const noOnBoarded = !address || !onBoardedAccounts.includes(address)
  const [ showOnBoarding, setShowOnBoarding ] = useState(noOnBoarded)
  const [ actions, setAction ] = useState(false)
  const { api, isApiReady } = useApi()
  const isLogged = useIsSignIn()

  useEffect(() => {
    let unsubBalance: (() => void) | undefined
    let unsubBlog: (() => void) | undefined
    if (!isLogged) {
      return setCurrentStep(0)
    }

    if (!isApiReady) return setCurrentStep(StepsEnum.Disable);

    const subBlog = async (isBalanse: boolean) => {
      unsubBlog = await api.query.social.spaceIdsByOwner(address, (data) => {
        if (isBalanse && data.isEmpty) {
          step = StepsEnum.CreateSpace
        } else if (step === StepsEnum.Disable) {
          noOnBoarded && store.set(KEY, address)
        }
        setShowOnBoarding(step !== StepsEnum.Disable)
        setCurrentStep(step)
      });
    }

    let step = StepsEnum.Disable;
    const subBalance = async () => {
      console.log(api.query.system)
      if (!address) return
      unsubBalance = await api.derive.balances.all(address, (data) => {
        const balanse = data.freeBalance.toString()
        const isEmptyBalanse = balanse === '0'
        if (isEmptyBalanse) {
          step = StepsEnum.GetTokens
        }
        subBlog(!isEmptyBalanse)
      });
    }

    subBalance();

    return () => {
      unsubBlog && unsubBlog()
      unsubBalance && unsubBalance()
    }
  }, [ currentStep, address, isApiReady ])

  console.log(useRouter().pathname)
  const contextValue = {
    state: {
      showOnBoarding: showOnBoarding,
      currentStep,
      actions
    },
    setCurrentStep,
    setAction
  }
  return <OnBoardingContext.Provider value={contextValue}>{props.children}</OnBoardingContext.Provider>
}

export function useBoarding () {
  return useContext(OnBoardingContext)
}

export function withBoardingContext (Component: React.ComponentType<any>) {
  return <OnBoardingProvider><Component/></OnBoardingProvider>
}
