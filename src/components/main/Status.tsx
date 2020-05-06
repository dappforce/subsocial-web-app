
import { KeyringOptions } from '@polkadot/ui-keyring/options/types';
import { QueueStatus, QueueTx, QueueAction$Add } from '@polkadot/react-components/Status/types';
import { I18nProps } from '@polkadot/react-components/types';

import React from 'react';
import keyringOption from '@polkadot/ui-keyring/options';
import { Status as StatusDisplay } from '@polkadot/react-components';
import { withCall, withMulti, withObservable } from '@polkadot/react-api/hoc';
import { stringToU8a } from '@polkadot/util';
import { xxhashAsHex } from '@polkadot/util-crypto';
import { EventRecord } from '@polkadot/types/interfaces';

type Props = I18nProps & {
  optionsAll?: KeyringOptions,
  queueAction: QueueAction$Add,
  stqueue: QueueStatus[],
  system_events?: EventRecord[],
  txqueue: QueueTx[]
};

let prevEventHash: string;

class Status extends React.PureComponent<Props> {
  componentDidUpdate ({ optionsAll = { account: [] as any } as KeyringOptions, queueAction, system_events }: Props) {
    const eventHash = xxhashAsHex(stringToU8a(JSON.stringify(system_events || [])));

    if (eventHash === prevEventHash) {
      return;
    }

    prevEventHash = eventHash;

    const addresses = optionsAll.account.map((account) => account.value);

    (system_events || []).forEach(({ event: { data, method, section } }) => {
      if (section === 'balances' && method === 'Transfer') {
        const account = data[1].toString();

        if (addresses.includes(account)) {
          queueAction({
            account,
            action: `${section}.${method}`,
            status: 'event',
            message: 'transfer received'
          });
        }
      } else if (section === 'democracy') {
        const index = data[0].toString();

        queueAction({
          action: `${section}.${method}`,
          status: 'event',
          message: `update on #{${index}}`
        });
      }
    });
  }

  render () {
    const { stqueue, txqueue } = this.props;

    return (
      <StatusDisplay
        stqueue={stqueue}
        txqueue={txqueue}
      />
    );
  }
}

export default withMulti(
  Status,
  withCall('query.system.events'),
  withObservable(keyringOption.optionsSubject, { propName: 'optionsAll' })
);
