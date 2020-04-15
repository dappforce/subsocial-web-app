import { Post } from '@subsocial/types/substrate/interfaces';
import { PostContent } from '@subsocial/types';
import { summarize } from '@subsocial/utils';
import { ipfs } from '../utils/SubsocialConnect';
import { isMobile } from 'react-device-detect';
import { BlockValueKind } from '../types';

export const LIMIT_SUMMARY = isMobile ? 150 : 300;

export type PostType = 'regular' | 'share';

export type PostExtContent = PostContent & {
  summary: string;
  blockValues: BlockValueKind[];
};

export const getTypePost = (post: Post): PostType => {
  const { extension } = post;
  if (extension.isSharedPost) {
    return 'share';
  } else {
    return 'regular';
  }
};

export const getExtContent = (content: PostContent | undefined | any): PostExtContent => {
  if (!content) return {} as PostExtContent;
  console.log('content from getExtContent', content)
  let blockValues = []
  if (content.blockValues && content.blockValues.length > 0) {
    blockValues = content.blockValues
  }

  const previewBlocks = blockValues.filter((x: BlockValueKind) => x.useOnPreview !== true)
  const firstText = previewBlocks.find((x: BlockValueKind) => x.kind === 'text')?.data || blockValues.find((x: BlockValueKind) => x.kind === 'text')?.data
  const summary = summarize(firstText as string, LIMIT_SUMMARY);

  return {
    ...content,
    blockValues,
    summary
  };
}

export const getBlockValuesFromIpfs = async (postContent: PostExtContent | any) => {
  const blockValues = []
  if (postContent.blocks && postContent.blocks.length > 0) {
    for (const block of postContent.blocks) {
      const blockValue = await ipfs.findPost(block.cid)
      blockValues.push(blockValue)
    }
  }
  console.log('blockValues from getBlockValuesFromIpfs', blockValues)
  return blockValues
}

export const loadContentFromIpfs = async (post: Post): Promise<PostExtContent> => {
  const ipfsContent = await ipfs.findPost(post.ipfs_hash);
  if (!ipfsContent) return {} as PostExtContent;

  return getExtContent(ipfsContent);
}
