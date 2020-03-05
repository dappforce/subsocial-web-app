import { isMobile } from 'react-device-detect';
import { Button$Sizes } from '@polkadot/react-components/Button/types';

export const TxBUTTON_SIZE: Button$Sizes = isMobile ? 'tiny' : 'small';
export const ANT_BUTTON_SIZE = isMobile ? 'small' : 'default';
