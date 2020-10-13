import React, { FunctionComponent, useState } from 'react';
import { /* CaretDownOutlined, CaretUpOutlined, */ CommentOutlined, NotificationOutlined } from '@ant-design/icons';
import { Comment, Button, Tag } from 'antd';
import { PostWithSomeDetails } from '@subsocial/types/dto';
import { CommentContent } from '@subsocial/types';
import { AuthorPreview } from '../profiles/address-views/AuthorPreview';
import { Space, Post } from '@subsocial/types/substrate/interfaces';
import Link from 'next/link';
import { pluralize } from '../utils/Plularize';
import { formatUnixDate, IconWithLabel, isHidden, ONE, ZERO, resolveBn } from '../utils';
import moment from 'moment-timezone';
import { EditComment } from './UpdateComment';
import { CommentsTree } from './CommentTree'
import { NewComment } from './CreateComment';
import { VoterButtons } from '../voting/VoterButtons';
import { PostDropDownMenu } from '../posts/view-post';
import { CommentBody } from './helpers';
import { equalAddresses } from '../substrate';
import { postUrl } from '../urls';
import { ShareDropdown } from '../posts/share/ShareDropdown';

type Props = {
  rootPost?: Post,
  space: Space,
  comment: PostWithSomeDetails,
  replies?: PostWithSomeDetails[],
  withShowReplies?: boolean
}

export const ViewComment: FunctionComponent<Props> = ({
  rootPost, comment, space = { id: 0 } as any as Space, replies, withShowReplies = true
}) => {
  const {
    post: {
      struct,
      content
    },
    owner
  } = comment

  if (isHidden(comment.post)) return null

  const {
    id,
    created: { time },
    owner: commentOwnerAddress,
    score,
    replies_count
  } = struct

  const [ showEditForm, setShowEditForm ] = useState(false);
  const [ showReplyForm, setShowReplyForm ] = useState(false);
  const [ showReplies ] = useState(withShowReplies);
  const [ repliesCount, setRepliesCount ] = useState(resolveBn(replies_count))

  const isFake = id.toString().startsWith('fake')
  const commentLink = postUrl(space, struct)

  const isRootPostOwner = equalAddresses(
    rootPost?.owner,
    struct.owner
  )

  /*   const ViewRepliesLink = () => {
    const viewActionMessage = showReplies
      ? <><CaretUpOutlined /> {'Hide'}</>
      : <><CaretDownOutlined /> {'View'}</>

    return <Link href={commentLink}>
      <a onClick={(event) => { event.preventDefault(); setShowReplies(!showReplies) }}>
        {viewActionMessage}{' '}
        <Pluralize count={repliesCount} singularText='reply' pluralText='replies' />
      </a>
    </Link>
  } */

  const isReplies = repliesCount.gt(ZERO)
  const isShowChildren = showReplyForm || showReplies || isReplies

  const ChildPanel = isShowChildren ? <div>
    {showReplyForm &&
    <NewComment
      post={struct}
      callback={(id) => {
        setShowReplyForm(false)
        id && setRepliesCount(repliesCount.add(ONE))
      }}
      withCancel
    />}
    {/* {isReplies && <ViewRepliesLink />} */}
    {showReplies && <CommentsTree rootPost={rootPost} parent={struct} replies={replies} space={space} />}
  </div> : null

  return <div className={isFake ? 'DfDisableLayout' : ''}>
    <Comment
      className='DfNewComment'
      actions={isFake ? [] : [
        <VoterButtons key={`voters-of-comments-${id}`} post={struct} className='DfCommentAction' />,
        <Button key={`reply-comment-${id}`} className='DfCommentAction' onClick={() => setShowReplyForm(true)}>
          <IconWithLabel icon={<CommentOutlined />} label='Reply' />
        </Button>,
        <ShareDropdown postDetails={comment} space={space} className='DfCommentAction' />
      ]}
      author={<div className='DfAuthorBlock'>
        <AuthorPreview
          address={commentOwnerAddress}
          owner={owner}
          isShort={true}
          isPadded={false}
          size={32}
          afterName={isRootPostOwner
            ? <Tag color='blue'><NotificationOutlined /> Post author</Tag>
            : undefined
          }
          details={
            <span>
              <Link href='/[spaceId]/posts/[postId]' as={commentLink}>
                <a className='DfGreyLink'>{moment(formatUnixDate(time)).fromNow()}</a>
              </Link>
              {' · '}
              {pluralize(score, 'Point')}
            </span>
          }
        />
        <PostDropDownMenu key={`comment-dropdown-menu-${id}`} postDetails={comment} space={space} />
      </div>}
      content={showEditForm
        ? <EditComment struct={struct} content={content as CommentContent} callback={() => setShowEditForm(false)}/>
        : <CommentBody comment={comment.post} />
      }
    >
      {ChildPanel}
    </Comment>
  </div>
};

export default ViewComment;
