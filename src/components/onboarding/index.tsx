import React from 'react'
import { OnBoardingCard } from './OnBoarding'
import { AuthProvider } from '../auth/AuthContext'

export default () => (
  <AuthProvider>
    <OnBoardingCard />
  </AuthProvider>
)

export * from './OnBoarding'
export * from './OnBoardingPage'
