import React from 'react'
import { isBrowser } from 'react-device-detect';
import BalanceDisplay from '@subsocial/react-components/Balance';
import { AnyAccountId } from '@subsocial/types/substrate';
import { useSubsocialApi } from 'src/components/utils/SubsocialApiContext';

type BalanceProps = {
  address: AnyAccountId
};

export const Balance: React.FunctionComponent<BalanceProps> = ({ address }) => {
  const { isApiReady } = useSubsocialApi();

  if (!isApiReady) return null;

  return (
    <BalanceDisplay
      label={isBrowser ? 'Balance: ' : ''}
      className='ui--AddressSummary-balance w-100'
      params={address}
    />
  );
};

export default Balance
