import React from 'react'
import { isBrowser } from 'react-device-detect';
import BalanceDisplay from '@polkadot/react-components/Balance';
import { AnyAccountId } from '@subsocial/types/substrate';
import { useApi } from '@polkadot/react-hooks';

type BalanceProps = {
  address: AnyAccountId
};

export const Balance: React.FunctionComponent<BalanceProps> = ({ address }) => {
  const { isApiReady } = useApi();

  if (!isApiReady) return null;

  return (
    <BalanceDisplay
      label={isBrowser ? 'Balance: ' : ''}
      className='ui--AddressSummary-balance'
      params={address}
    />
  );
};

export default Balance
