import React from 'react';
import { Button$Sizes } from '@subsocial/react-components/Button/types';
import { Post } from '@subsocial/types/substrate/interfaces';
import HiddenButton from '../utils/HiddenButton';

type HiddenPostButtonProps = {
  post: Post,
  size?: Button$Sizes
};

export function HiddenPostButton (props: HiddenPostButtonProps) {
  return <HiddenButton type='spaces' struct={props.post} {...props} />
}

export default HiddenPostButton;
