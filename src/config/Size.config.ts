import { isMobile as isBaseMobile, isTablet, isBrowser as isBaseBrowser } from 'react-device-detect'

export const isMobileDevice = isBaseMobile || isTablet
export const isBrowser = isBaseBrowser

export const DEFAULT_AVATAR_SIZE = isMobileDevice ? 30 : 36;
export const LARGE_AVATAR_SIZE = isMobileDevice ? 60 : 64;
