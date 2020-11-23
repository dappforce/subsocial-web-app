import React from 'react'
import { Space, Post } from '@subsocial/types/substrate/interfaces'
import { TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { TxDiv } from 'src/components/substrate/TxDiv'
import TxButton from 'src/components/utils/TxButton'
import Router from 'next/router'

export type FSetVisible = (visible: boolean) => void

type HiddenButtonProps = {
  struct: Space | Post,
  newTxParams: () => any[]
  type: 'post' | 'space' | 'comment',
  setVisibility?: FSetVisible
  label?: string,
  asLink?: boolean
}

export function HiddenButton (props: HiddenButtonProps) {
  const { struct, newTxParams, label, type, asLink, setVisibility } = props
  const hidden = struct.hidden.valueOf()

  const extrinsic = type === 'space' ? 'spaces.updateSpace' : 'posts.updatePost'

  const onTxSuccess: TxCallback = () => {
    setVisibility && setVisibility(!hidden)
    Router.reload()
  }

  const TxAction = asLink ? TxDiv : TxButton

  return <TxAction
    className={asLink ? 'm-0' : ''}
    label={label || hidden
      ? 'Make visible'
      : `Hide ${type}`
    }
    size='small'
    params={newTxParams}
    tx={extrinsic}
    onSuccess={onTxSuccess}
    failedMessage={`Failed to hide your ${type}`}
  />
}

export default HiddenButton
