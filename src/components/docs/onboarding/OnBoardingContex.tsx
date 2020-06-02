import React, { useState, createContext, useContext } from 'react';

export type OnBoardingState = {
  currentStep: number,
  openModal: boolean
}

function functionStub () {
  throw new Error('Function needs to be set in OnBoardingContext')
}

export type OnBoardingContextProps = {
  state: OnBoardingState
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>,
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>
}

const contextStub: OnBoardingContextProps = {
  state: {
    currentStep: 0,
    openModal: false
  },
  setCurrentStep: functionStub,
  setOpenModal: functionStub
}

export const OnBoardingContext = createContext<OnBoardingContextProps>(contextStub)
export function OnBoardingProvider (props: React.PropsWithChildren<any>) {
  const [ currentStep, setCurrentStep ] = useState(0)
  const [ openModal, setOpenModal ] = useState(false)

  const contextValue = {
    state: {
      currentStep,
      openModal
    },
    setCurrentStep,
    setOpenModal
  }
  return <OnBoardingContext.Provider value={contextValue}>{props.children}</OnBoardingContext.Provider>
}

export function useBoarding () {
  return useContext(OnBoardingContext)
}
