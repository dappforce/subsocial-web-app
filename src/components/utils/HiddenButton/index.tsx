import React from 'react'
import { TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { TxDiv } from 'src/components/substrate/TxDiv'
import TxButton from 'src/components/utils/TxButton'
import Router from 'next/router'
import { PostStruct, SpaceStruct } from 'src/types'

type SetVisibleFn = (visible: boolean) => void

type Props = {
  struct: SpaceStruct | PostStruct,
  newTxParams: () => any[]
  type: 'post' | 'space' | 'comment',
  setVisibility?: SetVisibleFn
  label?: string,
  asLink?: boolean
}

// TODO rename to HiddenButton -> ToggleVisibilityButton
export function HiddenButton (props: Props) {
  const { struct, newTxParams, label, type, asLink, setVisibility } = props
  const { hidden } = struct

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
