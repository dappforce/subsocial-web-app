import { api as polkadotApi } from '@polkadot/react-api';
import { Api, api } from '@subsocial/utils'

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
    const api = await Api.setup();
    setTimeout(() => {
      console.log(`Disconecting from Substrate API after ${MAX_CONN_TIME_SECS} secs`)
      Api.destroy()
    }, MAX_CONN_TIME_SECS * 1000);
    return api;
  }
}
