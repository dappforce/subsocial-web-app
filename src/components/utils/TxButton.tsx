import { BareProps, ApiProps } from '@polkadot/ui-api/types';
import { QueueTx$ExtrinsicAdd, PartialQueueTx$Extrinsic, TxCallback } from './types';

import React from 'react';
import { Button } from '@polkadot/ui-app';
import { QueueConsumer } from '@polkadot/ui-app/Status/Context';
import { withApi } from '@polkadot/ui-api';
import { assert } from '@polkadot/util';
import { withMyAccount, MyAccountProps } from './MyAccount';
import { useStorybookContext } from './StorybookContext';
import { Button$Sizes } from '@polkadot/ui-app/Button/types';
import { isClientSide } from './index';
import { SemanticShorthandItem, IconProps } from 'semantic-ui-react'
import { BUTTON_SIZE } from '../../config/Size.config'

type InjectedProps = {
  queueExtrinsic: QueueTx$ExtrinsicAdd;
};

type BasicButtonProps = {
  accountId?: string,
  size?: Button$Sizes,
  type?: 'submit' | 'button',
  isBasic?: boolean,
  isPrimary?: boolean,
  isDisabled?: boolean,
  label?: React.ReactNode,
  params: Array<any>,
  tx: string,

  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  compact?: boolean
  icon?: boolean | SemanticShorthandItem<IconProps>

  onClick?: (sendTx: () => void) => void
  txFailedCb?: TxCallback
  txSuccessCb?: TxCallback
  txSentCb?: () => void
  txCancelledCb?: () => void
  txUpdateCb?: TxCallback
};

type Props = BareProps & ApiProps & MyAccountProps & PartialQueueTx$Extrinsic & BasicButtonProps

class TxButtonInner extends React.PureComponent<Props & InjectedProps> {
  render () {
    const { myAddress, accountId, isBasic, isPrimary = isBasic !== true, isDisabled, label, icon = '', size = BUTTON_SIZE, onClick } = this.props;
    const origin = accountId || myAddress;

    return (
      <Button
        {...this.props}
        isDisabled={isDisabled || !origin}
        isBasic={isBasic}
        isPrimary={isPrimary}
        label={label}
        icon={icon as string}
        size={size}
        onClick={() => {
          if (onClick) onClick(this.send);
          else this.send();
        }}
      />
    );
  }

  private send = (): void => {
    const {
      myAddress, accountId, api, params, queueExtrinsic, tx,
      txFailedCb, txSuccessCb, txSentCb, txCancelledCb
    } = this.props;
    const origin = accountId || myAddress;
    const [ section, method ] = tx.split('.');

    assert(api.tx[section] && api.tx[section][method], `Unable to find api.tx.${section}.${method}`);

    queueExtrinsic({
      accountId: origin,
      extrinsic: api.tx[section][method](...params) as any, // ???
      txFailedCb,
      txSuccessCb,
      txSentCb,
      txCancelledCb
    });
  }
}

class TxButton extends React.PureComponent<Props> {
  render () {
    return (
      <QueueConsumer>
        {({ queueExtrinsic }) => (
          <TxButtonInner
            {...this.props}
            queueExtrinsic={queueExtrinsic}
          />
        )}
      </QueueConsumer>
    );
  }
}

const mockSendTx = () => {
  const msg = 'Cannot send a Substrate tx in a mock mode'
  if (isClientSide()) {
    window.alert(`WARN: ${msg}`)
  } else if (typeof console.warn === 'function') {
    console.warn(msg)
  } else {
    console.log(`WARN: ${msg}`)
  }
}

function MockTxButton (props: BasicButtonProps) {
  const { isBasic, isPrimary = isBasic !== true, icon = '', onClick } = props

  return (
    <Button
      {...props}
      isPrimary={isPrimary}
      icon={icon as string}
      onClick={() => {
        if (onClick) onClick(mockSendTx)
        else mockSendTx()
      }}
    />
  )
}

const SubstrateTxButton = withApi(withMyAccount(TxButton))

function ResolvedButton (props: BasicButtonProps) {
  const { isStorybook = false } = useStorybookContext()

  return isStorybook
    ? <MockTxButton {...props} />
    : <SubstrateTxButton {...props} />
}

export default ResolvedButton
