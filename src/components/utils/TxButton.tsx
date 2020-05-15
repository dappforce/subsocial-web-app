
// Copyright 2017-2020 @polkadot/app-123code authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';

import Button from '@subsocial/react-components/Button';
import { useStorybookContext } from './StorybookContext';
import { isClientSide } from '.';
import { useMyAccount } from './MyAccountContext';
import { newLogger } from '@subsocial/utils';
import { useApi } from '@subsocial/react-hooks';
import TxButton from '@subsocial/react-components/TxButton';

const log = newLogger('TxButton')

const mockSendTx = () => {
  const msg = 'Cannot send a Substrate tx in a mock mode'
  if (isClientSide()) {
    window.alert(`WARN: ${msg}`)
  } else {
    log.warn(msg)
  }
}

function MockTxButton (props: any) {
  const { isBasic, isPrimary = isBasic !== true, icon = '', onClick } = props

  return (
    <Button
      {...props}
      isPrimary={isPrimary}
      icon={icon as string}
      onClick={() => {
        if (typeof onClick === 'function') onClick(mockSendTx)
        else mockSendTx()
      }}
    />
  )
}

function ResolvedButton (props: any) {
  const { isStorybook = false } = useStorybookContext()
  const { isApiReady } = useApi()
  const { state: { address } } = useMyAccount();
  return isStorybook
    ? <MockTxButton {...props} />
    : isApiReady ? <TxButton accountId={address} {...props} /> : null
}

export default ResolvedButton
