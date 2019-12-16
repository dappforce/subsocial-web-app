import { ApiPromise, WsProvider } from '@polkadot/api';
import { registerSubsocialTypes } from '../types';

export class Api {

  protected api!: ApiPromise;

  public setup = async () => {
    await this.connectToApi();
    return this.api;
  }

  public destroy = () => {
    const { api } = this;
    if (api && api.isReady) {
      api.disconnect();
      console.log(`Disconnect from Substrate API.`);
    }
  }

  private connectToApi = async () => {
    const rpcEndpoint = process.env.SUBSTRATE_URL || `ws://127.0.0.1:9944/`;
    const provider = new WsProvider(rpcEndpoint);

    // Register types before creating the API:
    registerSubsocialTypes();

    // Create the API and wait until ready:
    console.log(`Connecting to Substrate API: ${rpcEndpoint}`)
    this.api = await ApiPromise.create(provider);

    // Retrieve the chain & node information information via rpc calls
    const system = this.api.rpc.system;

    const [ chain, nodeName, nodeVersion ] = await Promise.all(
    [ system.chain(), system.name(), system.version() ]);

    console.log(`Connected to chain '${chain}' (${nodeName} v${nodeVersion})`);
  }
}

export default new Api();
