import { ipfsNodeUrl } from 'src/components/utils/env';
import CID from 'cids'

const getPath = (cid: string) => `ipfs/${cid}`

export const resolveIpfsUrl = (cid: string) => {
  try {
    return CID.isCID(new CID(cid)) ? `${ipfsNodeUrl}/${getPath(cid)}` : cid
  } catch (err) {
    return cid
  }
}
