import React, { useState } from 'react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { queryBlogsToProp } from '../utils/index';
import { Modal, Dropdown, Button } from 'semantic-ui-react';
import { withMyAccount, MyAccountProps } from '../utils/MyAccount';
import { PostId, PostExtension, SharedPost, BlogId } from '../types';
import { NewSharePost } from './EditPost';
import { ViewPost } from './ViewPost';
import ViewBlog from '../blogs/ViewBlog';
import Link from 'next/link';

type Props = MyAccountProps & {
  postId: PostId,
  open: boolean,
  close: () => void,
  blogsIds?: BlogId[]
};

const InnerShareModal = (props: Props) => {
  const { open, close, postId, blogsIds } = props;

  if (!blogsIds) return <em>Loading...</em>;

  const [blogId, setBlogId] = useState(blogsIds[0]);
  const extension = new PostExtension({ SharedPost: new SharedPost(postId) });

  const renderShareView = () => {

    if (blogsIds.length === 0) {
      return (
        <Link href='/new' as='/blog/new'><a className='ui button primary'>Create your first blog</a></Link>
      );
    }

    const blogs = blogsIds.map(id => ({
      key: id.toNumber(),
      text: <ViewBlog id={id} key={id} nameOnly />,
      value: id.toNumber()
    }));

    const saveBlog = (event: any, data: any) => {
      setBlogId(data);
    };
    return (<div className='DfShareModal'>
      <Dropdown
        placeholder='Select blog...'
        selection
        search
        size='tiny'
        options={blogs}
        onChange={saveBlog}
        defaultValue={blogs[0].value}
      />
      <NewSharePost
        blogId={blogId}
        extention={extension}
        withButtons={false}
      />
      <ViewPost id={postId} preview withStats={false} withActions={false} />
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
        <Button size='large' onClick={close}>Close</Button>
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
    queryBlogsToProp(`blogIdsByOwner`, { paramName: 'myAddress', propName: 'blogsIds' })
  )
);
