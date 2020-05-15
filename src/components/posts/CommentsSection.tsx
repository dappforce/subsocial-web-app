import React, { useState, useEffect } from 'react'
import { Post, Blog } from '@subsocial/types/substrate/interfaces'
import { ViewComment } from './ViewComment';
import { NewComment } from './NewComment';
import Section from '../utils/Section';
import mdToText from 'markdown-to-txt';
import { HeadMeta } from '../utils/HeadMeta';
import { PostData, ExtendedPostData } from '@subsocial/types/dto';
import { NextPage } from 'next';
import { getProfileName } from '../utils/utils';
import { Pluralize } from '../utils/Plularize';
import ViewPostLink from './ViewPostLink';
import { CommentsTree } from './CommentTree';
import { useSubstrateApi } from '../utils/SubsocialApiContext';

type CommentSectionProps = {
  blog: Blog,
  post: Post,
  replies?: ExtendedPostData[],
  hashId?: string
}

export const CommentSection: React.FunctionComponent<CommentSectionProps> = React.memo(({ post, hashId, blog, replies = [] }) => {
  const { total_replies_count, id } = post;
  const [ totalCount, setCount ] = useState(total_replies_count.toString())
  const substrate = useSubstrateApi();

  useEffect(() => {

    substrate.findPost(id).then((post) => {
      if (post) {
        setCount(post.total_replies_count.toString())
      }
    })

  }, [ false ])

  return <Section id={hashId} className='DfCommentSection'>
    <h3><Pluralize count={totalCount} singularText='comment' /></h3>
    <NewComment
      post={post}
    />
    <CommentsTree parentId={post.id} blog={blog} replies={replies} />
  </Section>
})

type CommentPageProps = {
  comment: ExtendedPostData,
  parentPost: PostData,
  blog: Blog,
  replies: ExtendedPostData[]
}

export const CommentPage: NextPage<CommentPageProps> = ({ comment, parentPost, replies, blog }) => {
  const { post: { struct, content }, owner } = comment;
  const { content: postContent } = parentPost;
  const address = struct.created.account.toString()
  const profileName = getProfileName({ address, owner }).toString()

  const renderResponseTitle = () => <>
    In response to{' '}
    <ViewPostLink blog={blog} post={parentPost.struct} title={postContent?.title} />
  </>

  return <Section className='DfContentPage DfEntirePost'>
    <HeadMeta desc={mdToText(content?.body)} title={`${profileName} commented on ${content?.title}`} />
    {renderResponseTitle()}
    <ViewComment owner={owner} blog={blog} struct={struct} content={content} replies={replies} withShowReplies />
  </Section>

}
