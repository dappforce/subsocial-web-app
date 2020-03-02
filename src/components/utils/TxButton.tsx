import { BareProps, ApiProps } from '@polkadot/react-api/types';
import { QueueTx$ExtrinsicAdd, PartialQueueTx$Extrinsic } from './types';

import React from 'react';
import { Button } from '@polkadot/react-components';
import { QueueConsumer } from '@polkadot/react-components/Status/Context';
import { withApi } from '@polkadot/react-api';
import { assert } from '@polkadot/util';
import { withMyAccount, MyAccountProps } from './MyAccount';
import { useStorybookContext } from '../stories/StorybookContext';
import { Button$Sizes } from '@polkadot/react-components/Button/types';

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
    const { myAddress, accountId, isBasic, isPrimary = !isBasic, size, isDisabled, label, onClick } = this.props;
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

function MockTxButton (props: Props) {
  const { isPrimary = true, onClick } = props;

  const mockSendTx = () => {
    console.warn('WARN: Cannot send tx in a mock mode');
  };

  return (
    <Button
      {...props}
      icon=''
      isPrimary={isPrimary}
      onClick={() => {
        if (onClick) onClick(mockSendTx);
        else mockSendTx();
      }}
    />
  );
}

function ResolvedButton (props: any) { // TODO fix props type!
  const { isStorybook = false } = useStorybookContext();

  const Component = isStorybook
    ? MockTxButton
    : withApi(withMyAccount(TxButton));

  return <Component {...props} />;
}

export default ResolvedButton;
