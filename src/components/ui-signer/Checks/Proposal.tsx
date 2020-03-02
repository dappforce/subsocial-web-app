// Copyright 2017-2019 @polkadot/ui-signer authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DerivedFees } from '@polkadot/api-derive/types';
import { I18nProps } from '@polkadot/react-components/types';
import { ExtraFees } from './types';

import BN from 'bn.js';
import React from 'react';
import { Compact } from '@polkadot/types';
import { withCall, withMulti } from '@polkadot/react-api';
import { Icon } from '@polkadot/react-components';

type Props = I18nProps & {
  deposit: BN | Compact,
  fees: DerivedFees,
  democracy_minimumDeposit?: BN
  onChange: (fees: ExtraFees) => void
};
type State = ExtraFees & {
  isBelowMinimum: boolean
};

export class Proposal extends React.PureComponent<Props, State> {
  state: State = {
    extraFees: new BN(0),
    extraAmount: new BN(0),
    extraWarn: false,
    isBelowMinimum: false
  };

  static getDerivedStateFromProps ({ deposit, democracy_minimumDeposit = new BN(0), onChange }: Props): State {
    const extraAmount = deposit instanceof Compact
      ? deposit.toBn()
      : deposit;
    const isBelowMinimum = extraAmount.lt(democracy_minimumDeposit);

    const update = {
      extraAmount,
      extraFees: new BN(0),
      extraWarn: isBelowMinimum
    };

    onChange(update);

    return {
      ...update,
      isBelowMinimum
    };
  }

  render () {
    const { extraAmount, isBelowMinimum } = this.state;

    return (
      <>
        {
          isBelowMinimum
            ? <div><Icon name='warning sign' />{'The deposit is below the {{minimum}} minimum required for the proposal to be evaluated'}</div>
            : undefined
        }
        {
          extraAmount.isZero()
            ? undefined
            : <div><Icon name='arrow right' />{'The deposit of {{deposit}} will be reserved until the proposal is completed'}</div>
        }
      </>
    );
  }
}

export default withMulti(
  Proposal,
  withCall('query.democracy.minimumDeposit')
);
