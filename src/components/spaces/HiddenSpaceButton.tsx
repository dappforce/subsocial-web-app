import React from 'react';
import { Space } from '@subsocial/types/substrate/interfaces';
import HiddenButton from '../utils/HiddenButton';
import { SpaceUpdate, OptionOptionText, OptionIpfsContent, OptionBool } from '@subsocial/types/substrate/classes';
import { Option } from '@polkadot/types'
import registry from '@subsocial/types/substrate/registry';

type HiddenSpaceButtonProps = {
  space: Space,
  asLink?: boolean
};

export function HiddenSpaceButton (props: HiddenSpaceButtonProps) {
  const { space } = props;
  const hidden = space.hidden.valueOf()

  const update = new SpaceUpdate({
    handle: new OptionOptionText(),
    content: new OptionIpfsContent(),
    hidden: new OptionBool(!hidden), // TODO has no implementation on UI
    permissions: new Option(registry, 'SpacePermissions')
  });

  const newTxParams = () => {
    return [ space.id, update ];
  };

  return <HiddenButton type='space' newTxParams={newTxParams} struct={space} {...props} />
}

export default HiddenSpaceButton;
