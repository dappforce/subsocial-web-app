import React, { useState, useEffect } from 'react'
import { PostId, Post } from '@subsocial/types/substrate/interfaces'
import ListData from '../utils/DataList';
import { ViewComment } from './ViewComment';
import { NewComment } from './NewComment';
import Section from '../utils/Section';
import { getProfileName } from '../profiles/address-views/Name';
import mdToText from 'markdown-to-txt';
import { HeadMeta } from '../utils/HeadMeta';
import { postUrl } from '../utils/urls'
import Link from 'next/link';
import { BlogData, PostData, ExtendedPostData } from '@subsocial/types/dto';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { newLogger, nonEmptyArr } from '@subsocial/utils';
import { NextPage } from 'next';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import { getBlogId } from '../utils/utils';
import BN from 'bn.js'
import { Pluralize } from '../utils/Plularize';

const log = newLogger('Comment')

type CommentsTreeProps = {
  comments: ExtendedPostData[]
}

const ViewCommentsTree: React.FunctionComponent<CommentsTreeProps> = ({ comments }) => {
  return nonEmptyArr(comments) ? <ListData
    dataSource={comments}
    renderItem={(item) => {
      const { post: { struct, content }, owner } = item;
      const address = struct.created.account.toString();

      return <ViewComment key={struct.id.toString()} address={address} struct={struct} content={content} owner={owner} />
    }}
  /> : null;
}

type CommentSectionProps = {
  post: Post
}

export const CommentSection: React.FunctionComponent<CommentSectionProps> = React.memo(({ post }) => {
  const { id, total_replies_count } = post;
  const [ newCommentId, setCommentId ] = useState<PostId>()

  return <Section className='DfCommentSection'>
    <h3><Pluralize count={total_replies_count.toString()} singularText='comment' /></h3>
    <NewComment post={post} callback={(id) => setCommentId(id as PostId)}/>
    <CommentsTree parentId={id} newCommentId={newCommentId}/>
  </Section>
})

type CommentPageProps = {
  comment: ExtendedPostData,
  post: PostData,
  blog: BlogData,
  replies: ExtendedPostData[]
}

export const CommentPage: NextPage<CommentPageProps> = ({ comment, post, replies, blog }) => {
  const { post: { struct, content }, owner } = comment;
  const { content: postContent } = post;
  const address = struct.created.account.toString()
  const profileName = getProfileName({ address, owner }).toString()

  const renderResponseTitle = () => <>
  In response to{' '}
    <Link
      href='/blogs/[blogId]/posts/[postId]'
      as={postUrl(blog.struct, post.struct)}
    >
      <a>{postContent?.title}</a>
    </Link>
  </>

  return <Section className='DfContentPage DfEntirePost'>
    <HeadMeta desc={mdToText(content?.body)} title={`${profileName} commented on ${content?.title}`} />
    {renderResponseTitle()}
    <ViewCommentsTree comments={replies} />
  </Section>

}

CommentPage.getInitialProps = async (props): Promise<any> => {
  const { res, query: { blogId, postId, commentId } } = props
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial;
  const idOrHandle = blogId as string

  const id = await getBlogId(idOrHandle)
  if (!id && res) {
    res.statusCode = 404
    return { statusCode: 404 }
  }

  const blog = id && await subsocial.findBlog(id)
  const post = await subsocial.findPost(new BN(postId as string))

  if ((!blog?.struct || !post?.struct) && res) {
    res.statusCode = 404
    return { statusCode: 404 }
  }

  const currentCommentId = new BN(commentId as string)
  const replyIds = await substrate.getReplyIdsByPostId(currentCommentId);
  const comments = await subsocial.findPostsWithDetails([ ...replyIds, currentCommentId ]);
  const comment = comments.pop()

  return {
    blog,
    post,
    comment,
    replies: comments
  }
}

type LoadProps = {
  parentId: PostId,
  newCommentId?: PostId
}

export const withLoadedComments = (Component: React.ComponentType<CommentsTreeProps>) => {
  return (props: LoadProps) => {
    const { parentId, newCommentId } = props;
    const [ replyComments, setComments ] = useState<ExtendedPostData[]>();
    const { subsocial, substrate } = useSubsocialApi();

    console.log('Reload comments')

    useEffect(() => {
      if (replyComments && replyComments.length > 0) return;
      const loadComments = async () => {
        const replyIds = await substrate.getReplyIdsByPostId(parentId);
        console.log(replyIds)
        const comments = await subsocial.findPostsWithDetails(replyIds);
        setComments(comments)
      }

      loadComments().catch(err => log.error('Failed load comments: %o', err))
    }, [ false ]);

    useEffect(() => {
      if (!newCommentId) return;

      const loadComment = async () => {
        const comment = await subsocial.findPostsWithDetails([ newCommentId ]);
        replyComments?.concat(...comment)
      }

      loadComment().catch(err => log.error('Failed load new comment: %o', err))
    }, [ newCommentId ])

    return replyComments ? <Component comments={replyComments} /> : null;
  }
}

export const CommentsTree = React.memo(withLoadedComments(ViewCommentsTree));
