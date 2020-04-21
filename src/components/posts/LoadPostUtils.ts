import { Post } from '@subsocial/types/substrate/interfaces';
import { PostContent } from '@subsocial/types';
import { summarize } from '@subsocial/utils';
import { isMobile } from 'react-device-detect';
import { getSubsocialApi } from '../utils/SubsocialConnect';

export const LIMIT_SUMMARY = isMobile ? 150 : 300;

export type PostType = 'regular' | 'share';

export type PostExtContent = PostContent & {
  summary: string;
};

export const getTypePost = (post: Post): PostType => {
  const { extension } = post;
  if (extension.isSharedPost) {
    return 'share';
  } else {
    return 'regular';
  }
};

export const getExtContent = (content: PostContent | undefined): PostExtContent => {
  if (!content) return {} as PostExtContent;

  const summary = summarize(content.body, LIMIT_SUMMARY);
  return {
    ...content,
    summary
  };
}

export const loadContentFromIpfs = async (post: Post): Promise<PostExtContent> => {
  const { ipfs } = await getSubsocialApi()
  const ipfsContent = await ipfs.findPost(post.ipfs_hash);
  if (!ipfsContent) return {} as PostExtContent;

  return getExtContent(ipfsContent);
}