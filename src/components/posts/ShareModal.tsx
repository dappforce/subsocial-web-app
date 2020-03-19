import React, { useState } from 'react';

import { withCalls, withMulti } from '@polkadot/react-api';
import { queryBlogsToProp } from '../utils/index';
import { Modal, Dropdown, Button } from 'semantic-ui-react';
import { withMyAccount, MyAccountProps } from '../utils/MyAccount';
import { BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
import { NewSharePost } from './EditPost';
import { ViewPost } from './ViewPost';
import { ViewBlog } from '../blogs/ViewBlog';
import Link from 'next/link';
import { Loading } from '../utils/utils';
import BN from 'bn.js';
import { PostExtension, SharedPost } from '@subsocial/types/substrate/classes';

type Props = MyAccountProps & {
  postId: BN,
  open: boolean,
  close: () => void,
  blogIds?: BlogId[]
};

const InnerShareModal = (props: Props) => {
  const { open, close, postId, blogIds } = props;

  if (!blogIds) return <Loading />;

  const [ blogId, setBlogId ] = useState(blogIds[0]);
  const extension = new PostExtension({ SharedPost: postId as SharedPost });

  const renderShareView = () => {
    if (blogIds.length === 0) {
      return (
        <Link href='/blogs/new'><a className='ui button primary'>Create your first blog</a></Link>
      );
    }

    type OptionDropdown = {
      key: number,
      text: JSX.Element,
      value: BlogId
    }

    const blogs: OptionDropdown[] = blogIds.map(id => ({
      key: id.toNumber(),
      text: <div><ViewBlog id={id} dropdownPreview imageSize={26}/></div>,
      value: id // value: id
    }));

    const saveBlog = (event: any, data: OptionDropdown) => {
      setBlogId(data.value);
    };
    return (<div className='DfShareModal'>
      <Dropdown
        placeholder='Select blog...'
        selection
        search
        size='tiny'
        options={blogs as any}
        onChange={saveBlog as any}
        defaultValue={blogs[0].value.toString()}
      />
      <NewSharePost
        blogId={blogId}
        extention={extension}
        withButtons={false}
      />
      <ViewPost id={postId} withStats={false} withActions={false} variant='preview'/>
    </div>
    );
  };

  return (
    <Modal
      onClose={close}
      open={open}
      size='small'
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header>Share post</Modal.Header>
      <Modal.Content scrolling className='noCenter'>
        {renderShareView()}
      </Modal.Content>
      <Modal.Actions>
        <Button size='medium' onClick={close}>Cancel</Button>
        <NewSharePost
          blogId={blogId}
          extention={extension}
          onlyTxButton
        />
      </Modal.Actions>
    </Modal>
  );
};

export const ShareModal = withMulti(
  InnerShareModal,
  withMyAccount,
  withCalls<Props>(
    queryBlogsToProp(`blogIdsByOwner`, { paramName: 'myAddress', propName: 'blogIds' })
  )
);
