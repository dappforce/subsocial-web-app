import { Post } from '@subsocial/types/substrate/interfaces';
import { PostContent } from '@subsocial/types';
import { isMobile } from 'react-device-detect';
import { getSubsocialApi } from '../utils/SubsocialConnect';

export const LIMIT_SUMMARY = isMobile ? 150 : 300;

export type PostType = 'regular' | 'share';

// TODO deprecated: get rid of this type:
export type PostExtContent = PostContent

export const getTypePost = (post: Post): PostType => {
  const { extension } = post;
  if (extension.SharedPost) {
    return 'share';
  } else {
    return 'regular';
  }
};

export const loadContentFromIpfs = async (post: Post): Promise<PostExtContent> => {
  const { ipfs } = await getSubsocialApi()
  const ipfsContent = await ipfs.findPost(post.ipfs_hash)

  if (!ipfsContent) return {} as PostExtContent;

  return ipfsContent
}
