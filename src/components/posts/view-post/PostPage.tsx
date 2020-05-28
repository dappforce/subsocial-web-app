import React from 'react';
import dynamic from 'next/dynamic';
import { DfMd } from '../../utils/DfMd';
import { HeadMeta } from '../../utils/HeadMeta';
import Section from '../../utils/Section';
import { isBrowser } from 'react-device-detect';
import { PostData, PostWithAllDetails, BlogData } from '@subsocial/types/dto';
import ViewTags from '../../utils/ViewTags';
import ViewPostLink from '../ViewPostLink';
import SharePostAction from '../SharePostAction';
import { CommentSection } from '../../comments/CommentsSection';
import { isRegularPost, PostDropDownMenu, PostCreator } from './helpers';
import { PostExtension } from '@subsocial/types/substrate/classes';
import Error from 'next/error'
import { NextPage } from 'next';
import { getSubsocialApi } from 'src/components/utils/SubsocialConnect';
import { getBlogId, unwrapSubstrateId } from 'src/components/utils/utils';
import partition from 'lodash.partition';
import BN from 'bn.js'

const Voter = dynamic(() => import('../../voting/Voter'), { ssr: false });
const StatsPanel = dynamic(() => import('../PostStats'), { ssr: false });

export type PostDetailsProps = {
  postStruct: PostWithAllDetails,
  blog?: BlogData,
  statusCode?: number,
  replies: PostWithAllDetails[]
}

export const PostPage: NextPage<PostDetailsProps> = ({ postStruct, blog, replies, statusCode }) => {
  if (statusCode === 404) return <Error statusCode={statusCode} />

  const { struct, content } = postStruct.post;
  if (!content) return null;

  const { title, body, image, canonical, tags } = content;
  const blogData = blog || postStruct.blog
  const blogStruct = blogData.struct;

  const goToCommentsId = 'comments'

  const renderResponseTitle = (parentPost?: PostData) => parentPost && <>
      In response to{' '}
    <ViewPostLink blog={blogStruct} post={parentPost.struct} title={parentPost.content?.title} />
  </>
  const titleMsg = isRegularPost(struct.extension as PostExtension)
    ? renderResponseTitle(postStruct.ext?.post)
    : title

  return <>
    <Section className='DfContentPage DfEntirePost'>
      <HeadMeta title={title} desc={body} image={image} canonical={canonical} tags={tags} />
      <div className='DfRow'>
        {<h1 className='DfPostName'>{titleMsg}</h1>}
        <PostDropDownMenu account={struct.created.account} post={struct} blog={blogStruct} />
      </div>
      <div className='DfRow'>
        <PostCreator postStruct={postStruct} withBlogName blog={blogData} />
        {isBrowser && <StatsPanel id={struct.id} goToCommentsId={goToCommentsId} />}
      </div>
      <div className='DfPostContent'>
        {image && <img src={image} className='DfPostImage' /* add onError handler */ />}
        <DfMd source={body} />
        {/* {renderBlogPreview(post)} */}
      </div>
      <ViewTags tags={tags} />
      <div className='DfRow'>
        <Voter struct={struct} />
        <SharePostAction postId={struct.id} className='DfShareAction' />
      </div>
    </Section>
    <CommentSection post={struct} hashId={goToCommentsId} replies={replies} blog={blogStruct} />
  </>
};

PostPage.getInitialProps = async (props): Promise<any> => {
  const { query: { blogId, postId }, res } = props;
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial;
  const idOrHandle = blogId as string
  const blogIdFromUrl = await getBlogId(idOrHandle)

  const postIdFromUrl = new BN(postId as string)
  const replyIds = await substrate.getReplyIdsByPostId(postIdFromUrl)
  const comments = await subsocial.findPostsWithAllDetails([ ...replyIds, postIdFromUrl ])
  const [ extPostsData, replies ] = partition(comments, x => x.post.struct.id.eq(postIdFromUrl))
  const extPostData = extPostsData.pop()
  const blogIdFromPost = unwrapSubstrateId(extPostData?.post.struct.blog_id)
  // If a blog id of this post is not equal to the blog id/handle from URL,
  // then redirect to the URL with the blog id of this post.
  if (blogIdFromPost && blogIdFromUrl && !blogIdFromPost.eq(blogIdFromUrl) && res) {
    res.writeHead(301, { Location: `/blogs/${blogIdFromPost.toString()}/posts/${postId}` })
    res.end()
  }

  return {
    postStruct: extPostData,
    replies
  }
};

export default PostPage
