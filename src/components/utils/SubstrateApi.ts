import { ApiPromise, WsProvider } from '@polkadot/api';
import { registerSubsocialTypes } from '../types';
import { api as polkadotApi } from '@polkadot/ui-api';

let api: ApiPromise | undefined

export { api };
export class SubstrateApi {
  protected api!: ApiPromise;

  protected connected: boolean = false;

  public setup = async () => {
    await this.connectToApi();
    api = this.api;
    this.connected = true;
    return this.api;
  }

  public destroy = () => {
    const { api, connected } = this;
    if (api && api.isReady && connected) {
      api.disconnect();
      console.log(`Disconnected from Substrate API.`);
    }
  }

  private connectToApi = async () => {
    const rpcEndpoint = process.env.SUBSTRATE_URL || `ws://127.0.0.1:9944/`;
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
    console.log('Get Substrate API: @polkadot api');
    return polkadotApi.isReady;
  } else if (api) {
    console.log('Get Substrate API: SSR api');
    return api;
  } else {
    console.log('Get Substrate API: Api.setup()');
    api = await Api.setup();
    setTimeout(() => {
      console.log(`Disconecting from Substrate API after ${MAX_CONN_TIME_SECS} secs`)
      Api.destroy()
    }, MAX_CONN_TIME_SECS * 1000);
    return api;
  }
}
