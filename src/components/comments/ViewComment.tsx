import React, { FunctionComponent, useState, useEffect } from 'react';
import { Comment, Menu, Dropdown, Icon } from 'antd';
import { ProfileData, PostWithAllDetails } from '@subsocial/types/dto';
import { AuthorPreview } from '../profiles/address-views/AuthorPreview';
import { DfMd } from '../utils/DfMd';
import { CommentContent } from '@subsocial/types';
import { Post, Blog } from '@subsocial/types/substrate/interfaces';
import Voter from '../voting/Voter';
import { useMyAddress } from '../utils/MyAccountContext';
import Link from 'next/link';
import { pluralize, Pluralize } from '../utils/Plularize';
import { formatUnixDate } from '../utils/utils';
import moment from 'moment-timezone';
import { EditComment, NewComment } from './NewComment';
import { CommentsTree } from './CommentTree'
import { postUrl } from '../utils/urls';
import { useSubstrateApi } from '../utils/SubsocialApiContext';
import SharePostAction from '../posts/SharePostAction';

type Props = {
  blog: Blog,
  owner?: ProfileData,
  struct: Post,
  content?: CommentContent,
  replies?: PostWithAllDetails[],
  withShowReplies?: boolean
}

export const ViewComment: FunctionComponent<Props> = ({ owner, struct, content, blog, replies, withShowReplies }) => {
  const myAddress = useMyAddress()

  const {
    id,
    created: { account, time },
    score,
    direct_replies_count
  } = struct

  const [ showEditForm, setShowEditForm ] = useState(false);
  const [ showReplyForm, setShowReplyForm ] = useState(false);
  const [ showReplies, setShowReplies ] = useState(withShowReplies);
  const [ repliesCount, setCount ] = useState(direct_replies_count.toString())
  const substrate = useSubstrateApi()

  const isMyStruct = myAddress === account.toString()
  const commentLink = postUrl(blog, struct);

  useEffect(() => {

    substrate.findPost(id).then((post) => {
      if (post) {
        setCount(post.direct_replies_count.toString())
      }
    })

  }, [ false ])

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
    {showReplies && <CommentsTree parentId={id} replies={replies} blog={blog}/>}
  </div> : null

  return <Comment
    className='DfNewComment'
    actions={!showReplyForm
      ? [
        <Voter key={`voters-of-comments-${id}`} struct={struct} />,
        <SharePostAction postId={id} className='DfShareAction' withIcon={false} />,
        <span key={`reply-comment-${id}`} onClick={() => setShowReplyForm(true)} >Reply</span>
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
};

export default ViewComment;
