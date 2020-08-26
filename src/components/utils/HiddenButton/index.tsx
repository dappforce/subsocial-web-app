import React from 'react';
import { Space, Post } from '@subsocial/types/substrate/interfaces';
import { TxCallback } from 'src/components/substrate/SubstrateTxButton';
import { TxDiv } from 'src/components/substrate/TxDiv';
import TxButton from 'src/components/utils/TxButton'
import styles from './index.module.sass'
import Router from 'next/router'

export type FSetVisible = (visible: boolean) => void

type HiddenButtonProps = {
  struct: Space | Post,
  newTxParams: () => any[]
  type: 'post' | 'space' | 'comment',
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
    Router.reload()
  };

  const TxComponents = asLink ? TxDiv : TxButton

  return <TxComponents
    className={asLink ? 'm-0' : styles.DfHiddenButton}
    label={label || hidden
      ? 'Make visible'
      : `Hide ${type}`
    }
    type='primary'
    size='small'
    ghost={true}
    params={newTxParams}
    tx={extrinsic}
    onSuccess={onTxSuccess}
    failedMessage={`Failed to hide your ${type}`}
  />
}

export default HiddenButton;
