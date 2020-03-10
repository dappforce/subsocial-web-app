import { ApiPromise, WsProvider } from '@polkadot/api';
import { getEnv } from './utils';
import { registerSubsocialTypes } from '../types';
import { api as polkadotApi } from '@polkadot/ui-api';

let api: ApiPromise | undefined

export { api };
export class SubstrateApi {
  protected api!: ApiPromise;

  public setup = async () => {
    await this.connectToApi();
    api = this.api;
    return this.api;
  }

  public connect = async (): Promise<ApiPromise> => {
    const rpcEndpoint = getEnv('SUBSTRATE_URL') || `ws://127.0.0.1:9944/`;
    const provider = new WsProvider(rpcEndpoint);

    // Register types before creating the API:
    registerSubsocialTypes();

    // Create the API and wait until ready:
    console.log(`Connecting to Substrate API at ${rpcEndpoint}`);
    this.api = await ApiPromise.create(provider);

    // Retrieve the chain & node information information via rpc calls
    const system = this.api.rpc.system;

    const [ chain, nodeName, nodeVersion ] = await Promise.all(
      [ system.chain(), system.name(), system.version() ]);

    console.log(`Connected to chain '${chain}' (${nodeName} v${nodeVersion})`);
  }
}

export const Api = new SubstrateApi();
export default Api;

const MAX_CONN_TIME_SECS = 10

export const getApi = async () => {
  if (polkadotApi) {
    console.warn('Get Substrate API: @polkadot api');
    return polkadotApi.isReady;
  } else if (api) {
    console.warn('Get Substrate API: SSR api');
    return api;
  } else {
    console.warn('Get Substrate API: Api.setup()');
    api = await Api.setup();
    setTimeout(() => {
      console.warn(`Disconecting from Substrate API after ${MAX_CONN_TIME_SECS} secs`)
      Api.destroy()
    }, MAX_CONN_TIME_SECS * 1000);
    return api;
  }
}
