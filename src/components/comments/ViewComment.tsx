import React, { FC, useState } from 'react'
import { /* CaretDownOutlined, CaretUpOutlined, */ CommentOutlined, NotificationOutlined } from '@ant-design/icons'
import { Comment, Button, Tag } from 'antd'
import { asCommentData, PostWithSomeDetails } from 'src/types'
import { CommentContent } from '@subsocial/types'
import { AuthorPreview } from '../profiles/address-views/AuthorPreview'
import Link from 'next/link'
import { pluralize } from '../utils/Plularize'
import { formatUnixDate, IconWithLabel, isHidden } from '../utils'
import dayjs from 'dayjs'
import { EditComment } from './UpdateComment'
import { CommentsTree } from './CommentTree'
import { NewComment } from './CreateComment'
import { VoterButtons } from '../voting/VoterButtons'
import { PostDropDownMenu } from '../posts/view-post'
import { CommentBody } from './helpers'
import { equalAddresses } from '../substrate'
import { postUrl } from '../urls'
import { ShareDropdown } from '../posts/share/ShareDropdown'
import { PostStruct, SpaceStruct } from 'src/types'

type Props = {
  space: SpaceStruct,
  rootPost?: PostStruct,
  comment: PostWithSomeDetails,
  replies?: PostWithSomeDetails[],
  withShowReplies?: boolean
}

export const ViewComment: FC<Props> = ({
  space = { id: 0 } as any as SpaceStruct,
  rootPost,
  comment,
  replies,
  withShowReplies = true
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
    createdAtTime,
    ownerId,
    score,
  } = struct

  const [ showEditForm, setShowEditForm ] = useState(false)
  const [ showReplyForm, setShowReplyForm ] = useState(false)
  const [ showReplies ] = useState(withShowReplies)
  const [ repliesCount, setRepliesCount ] = useState(struct.repliesCount)

  const isFake = id.toString().startsWith('fake')
  const commentLink = postUrl(space, comment.post)

  const isRootPostOwner = equalAddresses(
    rootPost?.ownerId,
    struct.ownerId
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

  const hasReplies = repliesCount > 0
  const isShowChildren = showReplyForm || showReplies || hasReplies

  const ChildPanel = isShowChildren ? <div>
    {showReplyForm &&
    <NewComment
      post={struct}
      callback={(id) => {
        setShowReplyForm(false)
        id && setRepliesCount(repliesCount + 1)
      }}
      withCancel
    />}
    {/* {hasReplies && <ViewRepliesLink />} */}
    {showReplies && <CommentsTree rootPost={rootPost} parent={struct} replies={replies} space={space} />}
  </div> : null

  const actionCss = 'DfCommentAction'

  return <div className={isFake ? 'DfDisableLayout' : ''}>
    <Comment
      className='DfNewComment'
      actions={isFake ? [] : [
        <VoterButtons key={`voters-of-comments-${id}`} post={struct} className={actionCss} />,
        <Button key={`reply-comment-${id}`} className={actionCss} onClick={() => setShowReplyForm(true)}>
          <IconWithLabel icon={<CommentOutlined />} label='Reply' />
        </Button>,
        <ShareDropdown key={`dropdown-comment-${id}`} postDetails={comment} space={space} className={actionCss} />
      ]}
      author={<div className='DfAuthorBlock'>
        <AuthorPreview
          address={ownerId}
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
              <Link href='/[spaceId]/[slug]' as={commentLink}>
                <a className='DfGreyLink'>{dayjs(formatUnixDate(createdAtTime)).fromNow()}</a>
              </Link>
              {' · '}
              {pluralize(score, 'Point')}
            </span>
          }
        />
        <PostDropDownMenu key={`comment-dropdown-menu-${id}`} post={comment.post} space={space} />
      </div>}
      content={showEditForm
        ? <EditComment struct={struct} content={content as CommentContent} callback={() => setShowEditForm(false)}/>
        : <CommentBody comment={asCommentData(comment.post)} />
      }
    >
      {ChildPanel}
    </Comment>
  </div>
}

export default ViewComment
