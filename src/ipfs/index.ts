import { ipfsNodeUrl } from 'src/components/utils/env';
import CID from 'cids'
import { Content } from '@subsocial/types/substrate/classes';
import { isDef } from '@subsocial/utils';

const getPath = (cid: string) => `api/v0/cat?arg=${cid}`

export const resolveIpfsUrl = (cid: string) => {
  try {
    return CID.isCID(new CID(cid)) ? `${ipfsNodeUrl}/${getPath(cid)}` : cid
  } catch (err) {
    return cid
  }
}

export const resolveCidOfContent = (content?: Content) =>
  (isDef(content) && content.isIpfs)
    ? content.asIpfs.toString()
    : undefined
