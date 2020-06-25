import React from 'react'
import AntdButton from 'antd/lib/button'
import { newLogger } from '@subsocial/utils'

import SubstrateTxButton, { TxButtonProps } from './SubstrateTxButton'
import { useStorybookContext } from '../utils/StorybookContext'
import { isClientSide } from '../utils'
import { useMyAddress } from '../auth/MyAccountContext'

const log = newLogger('TxButton')

const mockSendTx = () => {
  const msg = 'Cannot send a Substrate tx in a mock mode (e.g. in Stoorybook)'
  if (isClientSide()) {
    window.alert(`WARN: ${msg}`)
  } else {
    log.warn(msg)
  }
}

function ResolvedTxButton (props: TxButtonProps) {
  const { isStorybook = false } = useStorybookContext()
  const myAddress = useMyAddress()

  return isStorybook
    ? <AntdButton {...props} onClick={mockSendTx} />
    : <SubstrateTxButton {...props} accountId={myAddress} />
}

// TODO use React.memo() ??
export default ResolvedTxButton
