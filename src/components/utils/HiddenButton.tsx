import React from 'react';
import { Space, Post } from '@subsocial/types/substrate/interfaces';
import TxButton from './TxButton';
import { TxCallback } from 'src/components/substrate/SubstrateTxButton';
import { SubmittableResult } from '@polkadot/api';

export type FSetVisible = (visible: boolean) => void

type HiddenButtonProps = {
  struct: Space | Post,
  newTxParams: () => any[]
  type: 'post' | 'space',
  setVisibility?: FSetVisible
  label?: string,
  asLink?: boolean
};

export function HiddenButton (props: HiddenButtonProps) {
  const { struct, newTxParams, label, type, asLink, setVisibility } = props;
  const hidden = struct.hidden.valueOf()

  const extrinsic = type === 'space' ? 'spaces.updateSpace' : 'posts.updatePost'

  const onTxSuccess: TxCallback = (_txResult: SubmittableResult) => {
    setVisibility && setVisibility(!hidden);
  };

  return <TxButton
    className={`ml-3 ${asLink && 'DfButtonAsLink'}`}
    label={label || hidden
      ? 'Make visible'
      : 'Hidden'
    }
    params={newTxParams}
    tx={extrinsic}
    onSuccess={onTxSuccess}
  />
}

export default HiddenButton;
