import { isMobile } from 'react-device-detect';
import { ButtonSize } from 'antd/lib/button';

export const ANT_BUTTON_SIZE: ButtonSize = isMobile ? 'small' : undefined;
export const DEFAULT_AVATAR_SIZE = isMobile ? 30 : 36;
export const LARGE_AVATAR_SIZE = isMobile ? 40 : 44;
