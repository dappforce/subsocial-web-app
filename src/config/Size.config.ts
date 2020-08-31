import { ButtonSize } from 'antd/lib/button';
import { isMobile as isBaseMobile, isTablet, isBrowser as isBaseBrowser } from 'react-device-detect'

export const isMobileDevice = isBaseMobile || isTablet
export const isBrowser = isBaseBrowser

export const ANT_BUTTON_SIZE: ButtonSize = isMobileDevice ? 'small' : undefined;
export const DEFAULT_AVATAR_SIZE = isMobileDevice ? 30 : 36;
export const LARGE_AVATAR_SIZE = isMobileDevice ? 40 : 44;
