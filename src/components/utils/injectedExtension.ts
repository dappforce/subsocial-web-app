import { web3Accounts } from '@polkadot/extension-dapp';
import keyring from '@polkadot/ui-keyring';
import { ApiProps } from '@subsocial/react-api/types';
import uiSettings from '@polkadot/ui-settings';
import { DEFAULT_SS58, injectedPromise } from './Api';

interface InjectedAccountExt {
  address: string;
  meta: {
    name: string;
    source: string;
  };
}

export const injectedExtension = async ({ api, isDevelopment }: ApiProps) => {
  console.log('injectedAccounts')
  const properties = await api.rpc.system.properties()
  const ss58Format = uiSettings.prefix === -1
    ? properties.ss58Format.unwrapOr(DEFAULT_SS58).toNumber()
    : uiSettings.prefix;

  const injectedAccounts = await injectedPromise
    .then(() => web3Accounts())
    .then((accounts) => accounts.map(({ address, meta }): InjectedAccountExt => ({
      address,
      meta: {
        ...meta,
        name: `${meta.name} (${meta.source === 'polkadot-js' ? 'extension' : meta.source})`
      }
    })))
    .catch((error): InjectedAccountExt[] => {
      console.error('web3Enable', error);

      return [];
    })

  console.log(injectedAccounts)
  keyring.loadAll({
    genesisHash: api.genesisHash,
    isDevelopment,
    ss58Format,
    type: 'ed25519'
  }, injectedAccounts);

  return injectedAccounts.map(item => item.address)
}
