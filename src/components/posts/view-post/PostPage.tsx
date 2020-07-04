import React from 'react';
import dynamic from 'next/dynamic';
import { DfMd } from '../../utils/DfMd';
import { HeadMeta } from '../../utils/HeadMeta';
import Section from '../../utils/Section';
import { isBrowser } from 'react-device-detect';
import { PostData, PostWithAllDetails, SpaceData } from '@subsocial/types/dto';
import ViewTags from '../../utils/ViewTags';
import ViewPostLink from '../ViewPostLink';
import SharePostAction from '../SharePostAction';
import { CommentSection } from '../../comments/CommentsSection';
import { isRegularPost, PostDropDownMenu, PostCreator, HiddenPostAlert, PostNotFound } from './helpers';
import Error from 'next/error'
import { NextPage } from 'next';
import { getSubsocialApi } from 'src/components/utils/SubsocialConnect';
import { getSpaceId, unwrapSubstrateId } from 'src/components/utils/substrate';
import partition from 'lodash.partition';
import BN from 'bn.js'
import { RegularPreview } from '.';
import { PageContent } from 'src/components/main/PageWrapper';

const Voter = dynamic(() => import('../../voting/Voter'), { ssr: false });
const StatsPanel = dynamic(() => import('../PostStats'), { ssr: false });

export type PostDetailsProps = {
  postStruct: PostWithAllDetails,
  space?: SpaceData,
  statusCode?: number,
  replies: PostWithAllDetails[]
}

export const PostPage: NextPage<PostDetailsProps> = ({ postStruct, space, replies, statusCode }) => {
  if (statusCode === 404) return <Error statusCode={statusCode} />

  if (!postStruct || !space) return <PostNotFound />

  const { post, ext } = postStruct
  const { struct, content } = post;
  if (!content) return null;

  const isRegular = isRegularPost(struct.extension)
  const { title, body, image, canonical, tags } = content;
  const spaceData = space || postStruct.space
  const spaceStruct = spaceData.struct;

  const goToCommentsId = 'comments'

  const renderResponseTitle = (parentPost?: PostData) => parentPost && <>
      In response to{' '}
    <ViewPostLink space={spaceStruct} post={parentPost.struct} title={parentPost.content?.title} />
  </>
  const titleMsg = isRegular
    ? renderResponseTitle(postStruct.ext?.post)
    : title

  return <>
    <HiddenPostAlert post={postStruct} />
    <PageContent>
      <Section className='DfContentPage DfEntirePost'> {/* TODO Maybe delete <Section /> because <PageContent /> includes it */}
        <HeadMeta title={title} desc={body} image={image} canonical={canonical} tags={tags} />
        <div className='DfRow'>
          {<h1 className='DfPostName'>{titleMsg}</h1>}
          <PostDropDownMenu account={struct.created.account} post={struct} space={spaceStruct} />
        </div>
        <div className='DfRow'>
          <PostCreator postStruct={postStruct} withSpaceName space={spaceData} />
          {isBrowser && <StatsPanel id={struct.id} goToCommentsId={goToCommentsId} />}
        </div>
        {image && body &&
        <div className='DfPostContent'>
          <img src={image} className='DfPostImage' /* add onError handler */ />
          <DfMd source={body} />
          {/* {renderSpacePreview(post)} */}
        </div>}
        {!isRegular && ext &&
          <RegularPreview postStruct={ext as PostWithAllDetails} space={ext.space as SpaceData} /> }
        <ViewTags tags={tags} />
        <div className='DfRow'>
          <Voter struct={struct} />
          <SharePostAction postId={struct.id} className='DfShareAction' />
        </div>
      </Section>
      <CommentSection post={struct} hashId={goToCommentsId} replies={replies} space={spaceStruct} />
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
  const comments = await subsocial.findVisiblePostsWithAllDetails({ ids: [ ...replyIds, postIdFromUrl ] })
  const [ extPostsData, replies ] = partition(comments, x => x.post.struct.id.eq(postIdFromUrl))
  const extPostData = extPostsData.pop()
  const spaceIdFromPost = unwrapSubstrateId(extPostData?.post.struct.space_id)
  // If a space id of this post is not equal to the space id/handle from URL,
  // then redirect to the URL with the space id of this post.
  if (spaceIdFromPost && spaceIdFromUrl && !spaceIdFromPost.eq(spaceIdFromUrl) && res) {
    res.writeHead(301, { Location: `/spaces/${spaceIdFromPost.toString()}/posts/${postId}` })
    res.end()
  }

  return {
    postStruct: extPostData,
    replies
  }
};

export default PostPage
