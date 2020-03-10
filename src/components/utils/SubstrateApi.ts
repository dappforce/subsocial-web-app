import { ApiPromise, WsProvider } from '@polkadot/api';
import { api as polkadotApi } from '@polkadot/react-api';
import { types } from '../types/DfRegister';
import { getEnv } from './utils';

let api: ApiPromise | undefined

export { api };
export class SubstrateApi {

  protected api!: ApiPromise;

  protected connected: boolean = false;

  public connect = async (): Promise<ApiPromise> => {
    const rpcEndpoint = getEnv('SUBSTRATE_URL') || `ws://127.0.0.1:9944/`;
    const provider = new WsProvider(rpcEndpoint);

    // Create the API and wait until ready:
    console.log(`Connecting to Substrate API at ${rpcEndpoint}`);
    this.api = await ApiPromise.create({ provider, types });
    this.connected = true

    return this.api
  }

  public disconnect = () => {
    const { api: localApi, connected } = this;
    if (localApi && localApi.isReady && connected) {
      try {
        localApi.disconnect();
        console.log(`Disconnected from Substrate API.`);
      } catch (err) {
        console.log('Failed to disconnect from Substrate. Error:', err)
      } finally {
        api = undefined;
        this.connected = false
      }
    }
  }

  /** Retrieve the chain & node information via RPC calls and log into console.  */
  protected logChainInfo = async () => {
    const system = this.api.rpc.system;

    const [ chain, nodeName, nodeVersion ] = await Promise.all(
      [ system.chain(), system.name(), system.version() ]);

    console.log(`Connected to Substrate chain '${chain}' (${nodeName} v${nodeVersion})`)
  }
}

export const Api = new SubstrateApi();
export default Api;

const MAX_CONN_TIME_SECS = 10

export const getApi = async () => {
  if (polkadotApi) {
    console.log('Get Substrate API: @polkadot api');
    return polkadotApi.isReady;
  } else if (api) {
    console.log('Get Substrate API: SSR api');
    return api;
  } else {
    console.log('Get Substrate API: Api.setup()');
    api = await Api.connect();
    setTimeout(() => {
      console.log(`Disconecting from Substrate API after ${MAX_CONN_TIME_SECS} secs`)
      Api.disconnect()
    }, MAX_CONN_TIME_SECS * 1000);
    return api;
  }
}
