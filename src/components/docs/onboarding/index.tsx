import React from 'react'
import { OnBoardingProvider } from './OnBoardingContex'
import { OnBoardingCard } from './OnBoarding'

export default () => (
  <OnBoardingProvider>
    <OnBoardingCard />
  </OnBoardingProvider>
)

export * from './OnBoarding'
export * from './OnBoardingContex'
export * from './OnBoardingPage'
