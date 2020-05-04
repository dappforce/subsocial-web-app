import React from 'react'
import { ExtendedPostData } from '@subsocial/types';
import { PostId } from '@subsocial/types/substrate/interfaces'
import ListData from '../utils/DataList';
import { ViewComment } from './NewViewComment';
import { EditComment } from './NewEditComment';
import Section from '../utils/Section';
import { getProfileName } from '../profiles/address-views/Name';
import mdToText from 'markdown-to-txt';
import { HeadMeta } from '../utils/HeadMeta';

type CommentsTreeProps = {
    comments: ExtendedPostData[]
}

const CommentsTree: React.FunctionComponent<CommentsTreeProps> = ({ comments }) => {
    return <ListData
    dataSource={comments}
    renderItem={(item) => {
      const { post: { struct, content }, owner } = item;
      const address = struct.created.account.toString();

      return <ViewComment key={struct.id.toString()} address={address} struct={struct} content={content} owner={owner} />
    }}
  />
}

type CommentSectionProps = CommentsTreeProps & {
  rootId: PostId
}

const CommentSection: React.FunctionComponent<CommentSectionProps> = ({ comments, rootId }) => (
  <div className='DfCommentSection'>
    <EditComment parentId={rootId} />
    <CommentsTree comments={comments} />
  </div>
)

type CommentPageProps = {
  comment: ExtendedPostData
}

const CommentPage: React.FunctionComponent<CommentPageProps> = ({ comment }) => {
  const { post: { struct, content }, owner } = comment;
  const address = struct.created.account.toString()
  const profileName = getProfileName({ address, owner }).toString()

  const renderResponseTitle = () => <>
  In response to{' '}
  <Link
    href='/blogs/[blogId]/posts/[postId]'
    as={`/blogs/${post.blog_id}/posts/${post_id.toString()}`}
    >
      <a>{postContent.title}</a>
    </Link>
  </>

  return <Section className='DfContentPage DfEntirePost'>
      <HeadMeta desc={mdToText(content?.body)} title={`${profileName} commented on ${content?.title}`} />

  </Section> 

}