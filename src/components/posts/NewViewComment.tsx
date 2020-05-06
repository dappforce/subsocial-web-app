import React, { FunctionComponent, useState } from 'react';
import { Comment, Menu, Dropdown, Icon } from 'antd';
import { ProfileData } from '@subsocial/types/dto';
import { AuthorPreview } from '../profiles/address-views/AuthorPreview';
import { AnyAccountId } from '@subsocial/types/substrate';
import { DfMd } from '../utils/DfMd';
import { PostContent } from '@subsocial/types';
import { Post } from '@subsocial/types/substrate/interfaces';
import Voter from '../voting/Voter';
import { useMyAddress } from '../utils/MyAccountContext';
import Link from 'next/link';
import { pluralize } from '../utils/Plularize';
import { formatUnixDate } from '../utils/utils';
import moment from 'moment-timezone';
import { EditComment } from './NewEditComment';

type Props = {
  owner?: ProfileData,
  address: AnyAccountId,
  struct: Post,
  content?: PostContent
}

export const ViewComment: FunctionComponent<Props> = ({ children = null, owner, struct, content }) => {
  const myAddress = useMyAddress()

  const {
    id,
    created: { account, time },
    score
  } = struct

  const [ showEditForm, setShowEditForm ] = useState(false);
  const [ showReplyForm, setShowReplyForm ] = useState(false);

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
      ? <EditComment struct={struct} content={content} post={struct} callback={() => setShowEditForm(false)}/>
      : <DfMd source={content?.body} />
    }
  >
    {showReplyForm && <EditComment post={struct} callback={() => setShowReplyForm(false)}/>}
    {children}
  </Comment>
};

export default ViewComment;
