import React, { FunctionComponent, useState } from 'react';
import { Comment, Menu, Dropdown, Icon } from 'antd';
import { PostWithAllDetails } from '@subsocial/types/dto';
import { AuthorPreview } from '../profiles/address-views/AuthorPreview';
import { DfMd } from '../utils/DfMd';
import { CommentContent } from '@subsocial/types';
import { Space } from '@subsocial/types/substrate/interfaces';
import { useMyAddress } from '../auth/MyAccountContext';
import Link from 'next/link';
import { pluralize, Pluralize } from '../utils/Plularize';
import { formatUnixDate } from '../utils/utils';
import moment from 'moment-timezone';
import { EditComment } from './UpdateComment';
import { CommentsTree } from './CommentTree'
import { postUrl } from '../utils/urls';
import SharePostAction from '../posts/SharePostAction';
import { NewComment } from './CreateComment';
import { VoterButtons } from '../voting/VoterButtons';

type Props = {
  space: Space,
  comment: PostWithAllDetails,
  replies?: PostWithAllDetails[],
  withShowReplies?: boolean
}

export const ViewComment: FunctionComponent<Props> = ({ comment, space = { id: 0 } as any as Space, replies, withShowReplies }) => {
  const myAddress = useMyAddress()

  const {
    post: {
      struct,
      content
    },
    owner
  } = comment

  const {
    id,
    created: { account, time },
    score,
    direct_replies_count
  } = struct

  const [ showEditForm, setShowEditForm ] = useState(false);
  const [ showReplyForm, setShowReplyForm ] = useState(false);
  const [ showReplies, setShowReplies ] = useState(withShowReplies);
  const [ repliesCount ] = useState(direct_replies_count.toString())

  const isFake = id.toString().startsWith('fake')
  const isMyStruct = myAddress === account.toString()
  const commentLink = postUrl(space, struct);

  const RenderDropDownMenu = () => {

    const showDropdown = isMyStruct || true;

    const menu = (
      <Menu>
        {(isMyStruct || true) && <Menu.Item key='0'>
          <div onClick={() => setShowEditForm(true)}>Edit</div>
        </Menu.Item>}
        {/* {edit_history.length > 0 && <Menu.Item key='1'>
          <div onClick={() => setOpen(true)} >View edit history</div>
        </Menu.Item>} */}
      </Menu>
    );

    return (<>{showDropdown &&
    <Dropdown overlay={menu} placement='bottomRight'>
      <Icon type='ellipsis' />
    </Dropdown>}
    {/* open && <CommentHistoryModal id={id} open={open} close={close} /> */}
    </>);
  };

  const ViewRepliesLink = () => {
    const viewActionMessage = showReplies ? <><Icon type="caret-up" /> {'Hide'}</> : <><Icon type="caret-down" /> {'View'}</>
    return <Link href={commentLink}>
      <a onClick={(event) => { event.preventDefault(); setShowReplies(!showReplies) }}>
        {viewActionMessage}
        {' '}
        <Pluralize count={repliesCount} singularText='reply' pluralText='replies' />
      </a>
    </Link>
  }

  const isReplies = repliesCount !== '0';
  const isShowChild = showReplyForm || showReplies || isReplies;

  const ChildPanel = isShowChild ? <div className="DfCommentChild">
    {showReplyForm &&
    <NewComment
      post={struct}
      callback={() => setShowReplyForm(false)}
      withCancel
    />}
    {isReplies && <ViewRepliesLink />}
    {showReplies && <CommentsTree parentId={id} replies={replies} space={space}/>}
  </div> : null

  return <div className={isFake ? 'DfDisableLayout' : ''}>
    <Comment
      className='DfNewComment'
      actions={!showReplyForm
        ? [
          <VoterButtons key={`voters-of-comments-${id}`} post={struct} className='DfShareAction' />,
          <span key={`reply-comment-${id}`} onClick={() => setShowReplyForm(true)} >Reply</span>,
          <SharePostAction postStruct={comment} className='DfShareAction' preview />
        ]
        : []}
      author={<div className='DfAuthorBlock'>
        <AuthorPreview
          address={account}
          owner={owner}
          isShort={true}
          isPadded={false}
          size={32}
          details={
            <span>
              <Link href={commentLink}>
                <a className='DfGreyLink'>{moment(formatUnixDate(time)).fromNow()}</a>
              </Link>
              {' · '}
              {pluralize(score, 'Point')}
            </span>
          }
        />
        <RenderDropDownMenu key={`comment-dropdown-menu-${id}`} />
      </div>}
      content={showEditForm
        ? <EditComment struct={struct} content={content as CommentContent} callback={() => setShowEditForm(false)}/>
        : <DfMd source={content?.body} />
      }
    >
      {ChildPanel}
    </Comment>
  </div>
};

export default ViewComment;
