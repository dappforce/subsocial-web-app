import { BareProps, ApiProps } from '@polkadot/react-api/types';
import { QueueTx$ExtrinsicAdd, PartialQueueTx$Extrinsic } from './types';

import React from 'react';
import { Button } from '@polkadot/react-components';
import { QueueConsumer } from '@polkadot/react-components/Status/Context';
import { withApi } from '@polkadot/react-api';
import { assert } from '@polkadot/util';
import { withMyAccount, MyAccountProps } from './MyAccount';

type InjectedProps = {
  queueExtrinsic: QueueTx$ExtrinsicAdd;
};

type Props = BareProps & ApiProps & MyAccountProps & PartialQueueTx$Extrinsic & {
  accountId?: string,
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
    const { myAddress, accountId, isBasic, isPrimary = isBasic ? false : true, isDisabled, label, onClick } = this.props;
    const origin = accountId || myAddress;

    return (
      <Button
        {...this.props}
        isDisabled={isDisabled || !origin}
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
    const [section, method] = tx.split('.');

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

export default withApi(withMyAccount(TxButton));
