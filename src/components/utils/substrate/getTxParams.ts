import { newLogger } from '@subsocial/utils';
import { CommonContent } from '@subsocial/types';
import { IpfsHash } from '@subsocial/types/substrate/interfaces';
import { SubsocialIpfsApi } from '@subsocial/api/ipfs';

const log = newLogger('BuildTxParams')

type BuildTxParams = {
  json: CommonContent
  buildTxParamsCallback: (hash: IpfsHash) => any[]
  ipfs: SubsocialIpfsApi
  setIpfsHash: (cid: IpfsHash) => void
}

export const getTxParams = async ({ json, setIpfsHash, ipfs, buildTxParamsCallback }: BuildTxParams) => {
  try {
    const cid = await ipfs.saveContent(json)
    if (cid) {
      setIpfsHash(cid)
      return buildTxParamsCallback(cid)
    } else {
      log.error('Save to IPFS operation returned undefined CID')
    }
  } catch (err) {
    log.error(`Failed build tx params. ${err}`)
  }
  return []
}
