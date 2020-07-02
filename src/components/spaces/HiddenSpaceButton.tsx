import React from 'react';
import { Button$Sizes } from '@subsocial/react-components/Button/types';
import { Space } from '@subsocial/types/substrate/interfaces';
import HiddenButton from '../utils/HiddenButton';
import { SpaceUpdate, OptionOptionText, OptionText, OptionBool } from '@subsocial/types/substrate/classes';

type HiddenSpaceButtonProps = {
  space: Space,
  size?: Button$Sizes,
  asLink?: boolean
};

export function HiddenSpaceButton (props: HiddenSpaceButtonProps) {
  const { space } = props;
  const hidden = space.hidden.valueOf()

  const update = new SpaceUpdate({
    handle: new OptionOptionText(),
    ipfs_hash: new OptionText(),
    hidden: new OptionBool(!hidden) // TODO has no implementation on UI
  });

  const newTxParams = () => {
    return [ space.id, update ];
  };

  return <HiddenButton type='spaces' newTxParams={newTxParams} struct={space} {...props} />
}

export default HiddenSpaceButton;
