import React from 'react'
import { Space } from '@subsocial/types/substrate/interfaces'
import { ViewComment } from './ViewComment'
import { NewComment } from './CreateComment'
import { mdToText } from 'src/utils'
import { PostWithSomeDetails, PostData } from '@subsocial/types/dto'
import { NextPage } from 'next'
import { getProfileName } from '../substrate'
import { Pluralize } from '../utils/Plularize'
import ViewPostLink from '../posts/ViewPostLink'
import { CommentsTree } from './CommentTree'
import Section from '../utils/Section'
import { PageContent } from '../main/PageWrapper'
import { postUrl } from '../urls'

type CommentSectionProps = {
  space: Space,
  post: PostWithSomeDetails,
  replies?: PostWithSomeDetails[],
  hashId?: string,
  withBorder?: boolean
}

export const CommentSection: React.FunctionComponent<CommentSectionProps> = React.memo(({ post, hashId, space, replies = [], withBorder }) => {
  const { post: { struct } } = post
  const { replies_count } = struct
  const totalCount = replies_count.toString()

  return <Section id={hashId} className={`DfCommentSection ${withBorder && 'TopBorder'}`}>
    <h3><Pluralize count={totalCount} singularText='comment' /></h3>
    <NewComment post={struct} asStub />
    <CommentsTree rootPost={struct} parent={struct} space={space} replies={replies} />
  </Section>
})

type CommentPageProps = {
  comment: PostWithSomeDetails,
  parentPost: PostData,
  space: Space,
  replies: PostWithSomeDetails[]
}

export const CommentPage: NextPage<CommentPageProps> = ({ comment, parentPost, replies, space }) => {
  const { post: { struct, content }, owner } = comment
  const { content: postContent } = parentPost
  const address = struct.owner.toString()
  const profileName = getProfileName({ address, owner }).toString()

  const renderResponseTitle = () => <>
    In response to{' '}
    <ViewPostLink space={space} post={parentPost} title={postContent?.title} />
  </>

  const meta = {
    title: `${profileName} commented on ${content?.title}`,
    desc: mdToText(content?.body),
    canonical: postUrl(space, comment.post),
  }

  return (
    <PageContent meta={meta} className='DfContentPage DfEntirePost'>
      {renderResponseTitle()}
      <ViewComment space={space} comment={comment} replies={replies} withShowReplies />
    </PageContent>
  )
}
