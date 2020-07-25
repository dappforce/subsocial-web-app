import { newLogger } from '@subsocial/utils';
import { CommonContent } from '@subsocial/types';
import { IpfsHash } from '@subsocial/types/substrate/interfaces';
import { SubsocialIpfsApi } from '@subsocial/api/ipfs';

const log = newLogger('BuildTxParams')

// TODO rename setIpfsHash -> setIpfsCid
type Params<C extends CommonContent> = {
  ipfs: SubsocialIpfsApi
  json: C
  setIpfsHash: (cid: IpfsHash) => void
  buildTxParamsCallback: (cid: IpfsHash) => any[]
}

// TODO rename to: pinToIpfsAndBuildTxParams()
export const getTxParams = async <C extends CommonContent> ({
  ipfs,
  json,
  setIpfsHash,
  buildTxParamsCallback
}: Params<C>) => {
  try {
    const cid = await ipfs.saveContent(json)
    if (cid) {
      setIpfsHash(cid)
      return buildTxParamsCallback(cid)
    } else {
      log.error('Save to IPFS returned an undefined CID')
    }
  } catch (err) {
    log.error(`Failed to build tx params. ${err}`)
  }
  return []
}
