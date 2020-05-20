import { isMobile } from 'react-device-detect';
import { Button$Sizes } from '@subsocial/react-components/Button/types';

export const TX_BUTTON_SIZE: Button$Sizes = isMobile ? 'tiny' : 'small';
export const ANT_BUTTON_SIZE = isMobile ? 'small' : 'default';
export const DEFAULT_AVATAR_SIZE = isMobile ? 30 : 36;
export const LARGE_AVATAR_SIZE = isMobile ? 40 : 44;
