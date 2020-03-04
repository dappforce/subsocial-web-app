import { BareProps, ApiProps } from '@polkadot/ui-api/types';
import { QueueTx$ExtrinsicAdd, PartialQueueTx$Extrinsic } from './types';

import React from 'react';
import { Button } from '@polkadot/ui-app';
import { QueueConsumer } from '@polkadot/ui-app/Status/Context';
import { withApi } from '@polkadot/ui-api';
import { assert } from '@polkadot/util';
import { withMyAccount, MyAccountProps } from './MyAccount';
import { useStorybookContext } from '../stories/StorybookContext';
import { Button$Sizes } from '@polkadot/ui-app/Button/types';
import { isClientSide } from './index';

type InjectedProps = {
  queueExtrinsic: QueueTx$ExtrinsicAdd;
};

type Props = BareProps & ApiProps & MyAccountProps & PartialQueueTx$Extrinsic & {
  accountId?: string,
  size?: Button$Sizes,
  type?: 'submit' | 'button',
  isBasic?: boolean,
  isPrimary?: boolean,
  isDisabled?: boolean,
  label: React.ReactNode,
  params: Array<any>,
  tx: string,
  onClick?: (sendTx: () => void) => void
};

class TxButtonInner extends React.PureComponent<Props & InjectedProps> {
  render () {
    const { myAddress, accountId, isBasic, isPrimary = isBasic !== true, size, isDisabled, label, onClick } = this.props;
    const origin = accountId || myAddress;

    return (
      <Button
        {...this.props}
        isDisabled={isDisabled || !origin}
        size={size}
        isBasic={isBasic}
        isPrimary={isPrimary}
        label={label}
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

function TxButton (props: Props) {
  const { isStorybook = false } = useStorybookContext()
  const { isBasic, isPrimary = isBasic !== true, onClick } = props

  if (isStorybook) return (
    <Button
      {...props}
      isPrimary={isPrimary}
      onClick={() => {
        if (onClick) onClick(mockSendTx);
        else mockSendTx();
      }}
    />
  )
  
  return (
    <QueueConsumer>
      {({ queueExtrinsic }) => (
        <TxButtonInner
          {...props}
          queueExtrinsic={queueExtrinsic}
        />
      )}
    </QueueConsumer>
  )
}

export default withApi(withMyAccount(TxButton))
