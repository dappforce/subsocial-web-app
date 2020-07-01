import React from 'react';
import { Button$Sizes } from '@subsocial/react-components/Button/types';
import { Space, Post } from '@subsocial/types/substrate/interfaces';
import { SpaceUpdate, OptionOptionText, OptionText, OptionBool } from '@subsocial/types/substrate/classes';
import TxButton from './TxButton';
import { TxCallback } from '@subsocial/react-components/Status/types';
import { SubmittableResult } from '@polkadot/api';

export type FSetVisible = (visible: boolean) => void

type HiddenButtonProps = {
  struct: Space | Post,
  type: 'posts' | 'spaces',
  setVisibility?: FSetVisible
  size?: Button$Sizes,
  label?: string
};

export function HiddenButton (props: HiddenButtonProps) {
  const { struct, label, type, size = 'small', setVisibility } = props;
  const hidden = struct.hidden.valueOf()

  const buildTxParams = () => {
    const update = new SpaceUpdate({
      handle: new OptionOptionText(),
      ipfs_hash: new OptionText(),
      hidden: new OptionBool(!hidden) // TODO has no implementation on UI
    });
    return [ struct.id, update ];
  };

  const onTxSuccess: TxCallback = (_txResult: SubmittableResult) => {
    setVisibility && setVisibility(!hidden);
  };

  return <TxButton
    size={size}
    isBasic
    className='DfButtonAsLink'
    label={label || hidden
      ? 'Make visible'
      : 'Hidden'
    }
    params={buildTxParams()}
    tx={`${type}.updateSpace`}
    onSuccess={onTxSuccess}
  />
}

export default HiddenButton;
