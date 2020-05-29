import { newLogger } from '@subsocial/utils';
import { CommonContent } from '@subsocial/types';
import { IpfsHash } from '@subsocial/types/substrate/interfaces';
import { SubsocialIpfsApi } from '@subsocial/api/ipfs';

const log = newLogger('BuildTxParams')

type BuildTxParams = {
  json: CommonContent,
  buildTxParamsCallback: (hash: IpfsHash) => any[],
  ipfs: SubsocialIpfsApi,
  setIpfsHash: (hash: IpfsHash) => void
}

export const getTxParams = async ({ json, setIpfsHash, ipfs, buildTxParamsCallback }: BuildTxParams) => {
  try {
    const hash = await ipfs.saveContent(json)
    console.log('SSSS', hash)
    if (hash) {
      setIpfsHash(hash);
      return buildTxParamsCallback(hash)
    } else {
      throw new Error('Invalid hash')
    }
  } catch (err) {
    log.error('Failed build tx params: %o', err)
    return []
  }
}
