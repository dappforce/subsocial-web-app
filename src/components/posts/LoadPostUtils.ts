import { Post, PostId } from "@subsocial/types/substrate/interfaces";
import { PostContent } from "@subsocial/types";
import { summarize } from "@subsocial/utils";
import { ipfs } from "../utils/SubsocialConnect";
import { SubsocialApi } from "@subsocial/api/fullApi";
import { PostData } from '@subsocial/types/dto';
import { isMobile } from "react-device-detect";

export const LIMIT_SUMMARY = isMobile ? 75 : 150;

export type PostType = 'regular' | 'share';

export type PostExtContent = PostContent & {
  summary: string;
};

export type PostDataListItem = {
  postData: PostData;
  postExtData: PostData;
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
    const ipfsContent = await ipfs.findPost(post.ipfs_hash);
    if (!ipfsContent) return {} as PostExtContent;

    return getExtContent(ipfsContent);
};

export const loadPostDataList = async (subsocial: SubsocialApi, ids: PostId[]) => {
    const postsData = await subsocial.findPosts(ids);
    const postsExtIds = postsData.map(item => item && item.struct && item.struct.id);
    const postsExtData = await subsocial.findPosts(postsExtIds as PostId[]);
    return postsData.map((item, i) => ({ postData: item, postExtData: postsExtData[i] }));
};