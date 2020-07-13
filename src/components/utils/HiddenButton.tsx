import React from 'react';
import { Space, Post } from '@subsocial/types/substrate/interfaces';
import { TxCallback, TxButton } from 'src/components/substrate/SubstrateTxButton';
import { TxDiv } from '../substrate/SubstrateTxDiv';

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

  const onTxSuccess: TxCallback = () => {
    setVisibility && setVisibility(!hidden);
  };

  const TxComponents = asLink ? TxDiv : TxButton

  return <TxComponents
    className={'m-0'}
    label={label || hidden
      ? 'Make visible'
      : 'Hide'
    }
    type='primary'
    params={newTxParams}
    tx={extrinsic}
    onSuccess={onTxSuccess}
  />
}

export default HiddenButton;
