import React from 'react';
import { Button$Sizes } from '@subsocial/react-components/Button/types';
import { Space } from '@subsocial/types/substrate/interfaces';
import HiddenButton from '../utils/HiddenButton';

type HiddenSpaceButtonProps = {
  space: Space,
  size?: Button$Sizes
};

export function HiddenSpaceButton (props: HiddenSpaceButtonProps) {
  return <HiddenButton type='spaces' struct={props.space} {...props} />
}

export default HiddenSpaceButton;
