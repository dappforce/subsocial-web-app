import React from 'react';
import { Button$Sizes } from '@subsocial/react-components/Button/types';
import { Space, Post } from '@subsocial/types/substrate/interfaces';
import TxButton from './TxButton';
import { TxCallback } from '@subsocial/react-components/Status/types';
import { SubmittableResult } from '@polkadot/api';

export type FSetVisible = (visible: boolean) => void

type HiddenButtonProps = {
  struct: Space | Post,
  newTxParams: () => any[]
  type: 'posts' | 'spaces',
  setVisibility?: FSetVisible
  size?: Button$Sizes,
  label?: string,
  asLink?: boolean
};

export function HiddenButton (props: HiddenButtonProps) {
  const { struct, newTxParams, label, type, asLink, size = 'small', setVisibility } = props;
  const hidden = struct.hidden.valueOf()

  const onTxSuccess: TxCallback = (_txResult: SubmittableResult) => {
    setVisibility && setVisibility(!hidden);
  };

  return <TxButton
    size={size}
    isBasic
    className={`ml-3 ${asLink && 'DfButtonAsLink'}`}
    label={label || hidden
      ? 'Make visible'
      : 'Hidden'
    }
    params={newTxParams}
    tx={`${type}.updateSpace`}
    onSuccess={onTxSuccess}
  />
}

export default HiddenButton;
