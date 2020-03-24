
// Copyright 2017-2020 @polkadot/app-123code authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { QueueTx, QueueTxExtrinsicAdd, TxFailedCallback, TxCallback } from '@polkadot/react-components/Status/types';
import { TxButtonProps, TxProps } from '@polkadot/react-components/types';

import React from 'react';
import { SubmittableResult } from '@polkadot/api';
import { withApi } from '@polkadot/react-api/hoc';
import { assert, isFunction, isUndefined } from '@polkadot/util';

import Button from '@polkadot/react-components/Button';
import { QueueConsumer } from '@polkadot/react-components/Status/Context';
import { useStorybookContext } from '../stories/StorybookContext';
import { MyAccountProps } from './MyAccount';
import { isClientSide } from '.';
import { Button$Sizes } from '@polkadot/react-components/Button/types';
import { SemanticShorthandItem, IconProps } from 'semantic-ui-react'
import { Index } from '@polkadot/types/interfaces';
import { useMyAccount } from './MyAccountContext';

interface InjectedProps {
  queueExtrinsic: QueueTxExtrinsicAdd;
  txqueue: QueueTx[];
}

type BasicButtonProps = TxProps & {
  accountId?: string;
  accountNonce?: Index;
  className?: string;
  iconSize?: Button$Sizes;
  isBasic?: boolean;
  isDisabled?: boolean;
  isNegative?: boolean;
  isPrimary?: boolean;
  isUnsigned?: boolean;
  label?: React.ReactNode;
  onFailed?: TxFailedCallback;
  onStart?: () => void;
  onSuccess?: TxCallback;
  onUpdate?: TxCallback;
  tooltip?: string;
  withSpinner?: boolean;
  // our props:
  type?: 'button' | 'submit',
  size?: Button$Sizes,
  icon?: SemanticShorthandItem<IconProps>,
  onClick?: (sendTx: () => void) => void
}

type InnerProps = InjectedProps & MyAccountProps & BasicButtonProps &
Omit<TxButtonProps, 'onClick' | 'icon'>;

interface State {
  extrinsic?: SubmittableExtrinsic;
  isSending: boolean;
}

class TxButtonInner extends React.PureComponent<InnerProps> {
  public state: State = {
    isSending: false
  };

  public render (): React.ReactNode {
    const { accountId, className, icon, size, iconSize, innerRef = null, isBasic, isDisabled, isNegative, isPrimary = !isBasic, isUnsigned, label = '', tooltip, onClick } = this.props;

    const { isSending } = this.state;
    const needsAccount = isUnsigned
      ? false
      : !accountId;

    return (
      <Button
        className={className}
        tooltip={tooltip}
        icon={icon as string}
        isBasic={isBasic}
        isDisabled={isSending || isDisabled || needsAccount}
        isLoading={isSending}
        isNegative={isNegative}
        isPrimary={
          isUndefined(isPrimary)
            ? (!isNegative && !isBasic)
            : isPrimary
        }
        label={label}
        onClick={() => {
          if (typeof onClick === 'function') onClick(this.send);
          else this.send();
        }}
        ref={innerRef}
        size={size || iconSize}
      />
    );
  }

  protected send = (): void => {
    const { accountId, api, extrinsic: propsExtrinsic, isUnsigned, onFailed, onStart, onSuccess, onUpdate, params = [], queueExtrinsic, tx = '', withSpinner = true } = this.props;
    let extrinsic: any;

    if (propsExtrinsic) {
      extrinsic = propsExtrinsic;
    } else {
      const [ section, method ] = tx.split('.');

      assert(api.tx[section] && api.tx[section][method], `Unable to find api.tx.${section}.${method}`);

      extrinsic = api.tx[section][method](...(
        isFunction(params)
          ? params()
          : params
      ));
    }

    assert(extrinsic, 'Expected generated extrinsic passed to TxButton');

    if (withSpinner) {
      this.setState({ isSending: true });
    }

    queueExtrinsic({
      accountId,
      extrinsic,
      isUnsigned,
      txFailedCb: withSpinner ? this.onFailed : onFailed,
      txStartCb: onStart,
      txSuccessCb: withSpinner ? this.onSuccess : onSuccess,
      txUpdateCb: onUpdate
    });

    // TODO pay attention to this part. Maybe recursion
    // onClick && onClick();
  }

  private onFailed = (result: SubmittableResult | null): void => {
    const { onFailed } = this.props;

    this.setState({ isSending: false });

    onFailed && onFailed(result);
  }

  private onSuccess = (result: SubmittableResult): void => {
    const { onSuccess } = this.props;

    this.setState({ isSending: false });

    onSuccess && onSuccess(result);
  }
}

class TxButton extends React.PureComponent<InnerProps, State> {
  protected button: any = React.createRef();

  public render (): React.ReactNode {
    const { innerRef, ...props } = this.props;
    return (
      <QueueConsumer>
        {({ queueExtrinsic, txqueue }): React.ReactNode => (
          <TxButtonInner
            {...props}
            queueExtrinsic={queueExtrinsic}
            txqueue={txqueue}
            innerRef={innerRef}
          />
        )}
      </QueueConsumer>
    );
  }

  protected send = (): void => {
    this.button.current.send();
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
        if (typeof onClick === 'function') onClick(mockSendTx)
        else mockSendTx()
      }}
    />
  )
}

const SubstrateTxButton = withApi((TxButton))

function ResolvedButton (props: BasicButtonProps) {
  const { isStorybook = false } = useStorybookContext()
  const { state: { address } } = useMyAccount();
  return isStorybook
    ? <MockTxButton {...props} />
    : <SubstrateTxButton accountId={address} {...props} />
}

export default ResolvedButton
