import React from 'react'
import { isBrowser } from 'react-device-detect';
import BalanceDisplay from '@polkadot/react-components/Balance';

type BalanceProps = {
  address: string
};

export const Balance: React.FunctionComponent<BalanceProps> = ({ address }) => {
  return (
    <BalanceDisplay
      label={isBrowser ? 'Balance: ' : ''}
      className='ui--AddressSummary-balance'
      params={address}
    />
  );
};

export default Balance
