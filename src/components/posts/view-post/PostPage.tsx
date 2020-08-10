import React from 'react';
import dynamic from 'next/dynamic';
import { DfMd } from '../../utils/DfMd';
import { HeadMeta } from '../../utils/HeadMeta';
import Section from '../../utils/Section';
import { isBrowser } from 'react-device-detect';
import { PostData, PostWithAllDetails } from '@subsocial/types/dto';
import ViewTags from '../../utils/ViewTags';
import ViewPostLink from '../ViewPostLink';
import { CommentSection } from '../../comments/CommentsSection';
import { PostDropDownMenu, PostCreator, HiddenPostAlert, PostNotFound, PostActionsPanel, isComment, SharePostContent } from './helpers';
import Error from 'next/error'
import { NextPage } from 'next';
import { getSubsocialApi } from 'src/components/utils/SubsocialConnect';
import { getSpaceId, unwrapSubstrateId } from 'src/components/substrate';
import partition from 'lodash.partition';
import BN from 'bn.js'
import { PageContent } from 'src/components/main/PageWrapper';
import { isHidden, Loading } from 'src/components/utils';
import { useLoadHiddenSpace } from 'src/components/spaces/helpers';

const StatsPanel = dynamic(() => import('../PostStats'), { ssr: false });

export type PostDetailsProps = {
  postDetails: PostWithAllDetails,
  statusCode?: number,
  replies: PostWithAllDetails[]
}

export const PostPage: NextPage<PostDetailsProps> = ({ postDetails, replies, statusCode }) => {
  if (statusCode === 404) return <Error statusCode={statusCode} />
  if (!postDetails || isHidden({ struct: postDetails.post.struct })) return <PostNotFound />

  const { post, ext, space } = postDetails

  const { struct, content } = post;

  if (!content) return null;

  const { title, body, image, canonical, tags } = content;
  const spaceData = space || postDetails.space || useLoadHiddenSpace(struct.owner).myHiddenSpaces

  if (!spaceData) return <Loading />

  const spaceStruct = spaceData.struct;

  const goToCommentsId = 'comments'

  const renderResponseTitle = (parentPost?: PostData) => parentPost && <>
      In response to{' '}
    <ViewPostLink space={spaceStruct} post={parentPost.struct} title={parentPost.content?.title} />
  </>

  const titleMsg = isComment(struct.extension)
    ? renderResponseTitle(postDetails.ext?.post)
    : title

  return <>
    <HiddenPostAlert post={post.struct} />
    <PageContent>
      <Section className='DfContentPage DfEntirePost'> {/* TODO Maybe delete <Section /> because <PageContent /> includes it */}
        <HeadMeta title={title} desc={body} image={image} canonical={canonical} tags={tags} />
        <div className='DfRow'>
          {<h1 className='DfPostName'>{titleMsg}</h1>}
          <PostDropDownMenu post={struct} space={spaceStruct} />
        </div>
        <div className='DfRow'>
          <PostCreator postDetails={postDetails} withSpaceName space={spaceData} />
          {isBrowser && <StatsPanel id={struct.id} goToCommentsId={goToCommentsId} />}
        </div>
        <div className='DfPostContent'>
          {ext
            ? <SharePostContent postDetails={postDetails} space={space} />
            : <>
              {image && <img src={image} className='DfPostImage' /* add onError handler */ />}
              {body && <DfMd source={body} />}
            </>}
        </div>
        <ViewTags tags={tags} />
        <div className='DfRow'>
          <PostActionsPanel postDetails={postDetails} />
        </div>
        <CommentSection post={postDetails} hashId={goToCommentsId} replies={replies} space={spaceStruct} />
      </Section>
    </PageContent>
  </>
};

PostPage.getInitialProps = async (props): Promise<any> => {
  const { query: { spaceId, postId }, res } = props;
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial;
  const idOrHandle = spaceId as string
  const spaceIdFromUrl = await getSpaceId(idOrHandle)

  const postIdFromUrl = new BN(postId as string)
  const replyIds = await substrate.getReplyIdsByPostId(postIdFromUrl)
  const comments = await subsocial.findVisiblePostsWithAllDetails([ ...replyIds, postIdFromUrl ])

  const [ extPostsData, replies ] = partition(comments, x => x.post.struct.id.eq(postIdFromUrl))
  const extPostData = extPostsData.pop() || await subsocial.findPostWithAllDetails(postIdFromUrl)

  const spaceIdFromPost = unwrapSubstrateId(extPostData?.post.struct.space_id)
  // If a space id of this post is not equal to the space id/handle from URL,
  // then redirect to the URL with the space id of this post.
  if (spaceIdFromPost && spaceIdFromUrl && !spaceIdFromPost.eq(spaceIdFromUrl) && res) {
    res.writeHead(301, { Location: `/spaces/${spaceIdFromPost.toString()}/posts/${postId}` })
    res.end()
  }

  return {
    postDetails: extPostData,
    replies
  }
};

export default PostPage
