import React, { createContext, useContext } from 'react';
import { useMediaQuery } from 'react-responsive'
import { isMobileDevice } from 'src/config/Size.config';

export type ResponsiveSizeState = {
  isMobile: boolean,
  isTablet: boolean,
  isDesktop: boolean,
  isNotMobile: boolean,
  isNotDesktop: boolean
}

const contextStub: ResponsiveSizeState = {
  isDesktop: true,
  isMobile: false,
  isNotMobile: false,
  isTablet: false,
  isNotDesktop: false
}

export const ResponsiveSizeContext = createContext<ResponsiveSizeState>(contextStub)

export function ResponsiveSizeProvider (props: React.PropsWithChildren<any>) {
  const value = {
    isDesktop: useMediaQuery({ minWidth: 992 }),
    isTablet: useMediaQuery({ minWidth: 768, maxWidth: 991 }),
    isMobile: useMediaQuery({ maxWidth: 767 }),
    isNotMobile: useMediaQuery({ minWidth: 768 }),
    isNotDesktop: useMediaQuery({ maxWidth: 991 })
  }

  return <ResponsiveSizeContext.Provider value={value}>
    {props.children}
  </ResponsiveSizeContext.Provider>
}

export function useResponsiveSize () {
  return useContext(ResponsiveSizeContext)
}

export function useIsMobileWidthOrDevice () {
  const { isMobile } = useResponsiveSize()
  return isMobileDevice || isMobile
}