import { ipfsNodeUrl } from 'src/components/utils/env';
import CID from 'cids'

export const resolveIpfsUrl = (cid: string) => {
  try {
    return CID.isCID(new CID(cid)) ? `${ipfsNodeUrl}/ipfs/${cid}` : cid
  } catch (err) {
    return cid
  }
}
