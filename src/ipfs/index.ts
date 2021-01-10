import { ipfsNodeUrl } from 'src/components/utils/env'
import CID from 'cids'
import memoize from 'lodash/memoize'

/** Memoized resolver of IPFS CID to a full URL. */
export const resolveIpfsUrl = memoize((cid: string) => {
  try {
    return CID.isCID(new CID(cid))
      ? `${ipfsNodeUrl}/ipfs/${cid}`
      : cid // Looks like CID is already a resolved URL.
  } catch (err) {
    return cid
  }
})
