import { ButtonSize } from 'antd/lib/button';
import { isMobile as isBaseMobile, isTablet, isBrowser as isBaseBrowser } from 'react-device-detect'

export const isMobile = isBaseMobile || isTablet
export const isBrowser = isBaseBrowser

export const ANT_BUTTON_SIZE: ButtonSize = isMobile ? 'small' : undefined;
export const DEFAULT_AVATAR_SIZE = isMobile ? 30 : 36;
export const LARGE_AVATAR_SIZE = isMobile ? 40 : 44;
