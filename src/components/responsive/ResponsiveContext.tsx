import React, { createContext, useContext } from 'react';
import { useMediaQuery } from 'react-responsive'

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
  const isDesktop = useMediaQuery({ minWidth: 992 })
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 })
  const isMobile = useMediaQuery({ maxWidth: 767 })
  const isNotMobile = useMediaQuery({ minWidth: 768 })
  const isNotDesktop = useMediaQuery({ maxWidth: 991 })

  return <ResponsiveSizeContext.Provider value={{ isDesktop, isMobile, isNotMobile, isTablet, isNotDesktop }}>
    {props.children}
  </ResponsiveSizeContext.Provider>
}

export function useResponsiveSize () {
  return useContext(ResponsiveSizeContext)
}
