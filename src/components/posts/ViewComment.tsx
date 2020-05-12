import React, { FunctionComponent, useState } from 'react';
import { Comment, Menu, Dropdown, Icon } from 'antd';
import { ProfileData } from '@subsocial/types/dto';
import { AuthorPreview } from '../profiles/address-views/AuthorPreview';
import { AnyAccountId } from '@subsocial/types/substrate';
import { DfMd } from '../utils/DfMd';
import { CommentContent } from '@subsocial/types';
import { Post, PostId } from '@subsocial/types/substrate/interfaces';
import Voter from '../voting/Voter';
import { useMyAddress } from '../utils/MyAccountContext';
import Link from 'next/link';
import { pluralize, Pluralize } from '../utils/Plularize';
import { formatUnixDate } from '../utils/utils';
import moment from 'moment-timezone';
import { EditComment, NewComment } from './NewComment';
import { CommentsTree } from './CommentsTree'

type Props = {
  owner?: ProfileData,
  address: AnyAccountId,
  struct: Post,
  content?: CommentContent
}

export const ViewComment: FunctionComponent<Props> = ({ owner, struct, content }) => {
  const myAddress = useMyAddress()

  const {
    id,
    created: { account, time },
    score,
    direct_replies_count,
    extension
  } = struct

  console.log(extension);
  const [ showEditForm, setShowEditForm ] = useState(false);
  const [ showReplyForm, setShowReplyForm ] = useState(false);
  const [ showReplices, setShowReplices ] = useState(false);
  const [ newRelicesId, setNewReplicesId ] = useState<PostId>();

  const isMyStruct = myAddress === account.toString()

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

  const ViewRepliecesLink = () => {
    const replies = direct_replies_count
    const viewActionMessage = showReplices ? <><Icon type="caret-up" /> {'Hide'}</> : <><Icon type="caret-down" /> {'View'}</>
    return replies.eqn(0)
      ? null
      : <Link href={''}>
        <a onClick={(event) => { event.preventDefault(); setShowReplices(!showReplices) }}>
          {viewActionMessage}
          {' '}
          <Pluralize count={direct_replies_count} singularText='reply' pluralText='replies' />
        </a>
      </Link>
  }

  return <Comment
    className='DfNewComment'
    actions={!showReplyForm
      ? [
        <Voter key={`voters-of-comments-${id}`} struct={struct} />,
        <span key={`reply-comment-${id}`} style={{ marginLeft: '.5rem' }} onClick={() => setShowReplyForm(true)} >Reply</span>
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
            <Link href={`/create-new-link`}>
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
    <div className="DfCommentChild">
      {showReplyForm && <NewComment post={struct} callback={(id) => { setShowReplyForm(false); setNewReplicesId(id as PostId) }} withCancel/>}
      <ViewRepliecesLink />
      {showReplices && <CommentsTree parentId={id} newCommentId={newRelicesId}/>}
    </div>
  </Comment>
};

export default ViewComment;
