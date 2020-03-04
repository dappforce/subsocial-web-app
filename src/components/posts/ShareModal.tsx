import React, { useState } from 'react';

import { withCalls, withMulti, registry } from '@polkadot/react-api';
import { queryBlogsToProp } from '../utils/index';
import { Modal, Dropdown, Button } from 'semantic-ui-react';
import { withMyAccount, MyAccountProps } from '../utils/MyAccount';
import { BlogId } from '@subsocial/types/interfaces/runtime';
import { Enum } from '@polkadot/types/codec';
import { NewSharePost } from './EditPost';
import { ViewPost } from './ViewPost';
import { ViewBlog } from '../blogs/ViewBlog';
import Link from 'next/link';
import { Loading } from '../utils/utils';
import BN from 'bn.js';

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
  const extension = new Enum(registry, { SharedPost: 'u64' }, { SharedPost: postId });

  const renderShareView = () => {
    if (blogIds.length === 0) {
      return (
        <Link href='/blogs/new'><a className='ui button primary'>Create your first blog</a></Link>
      );
    }

    const blogs = blogIds.map(id => ({
      key: id.toNumber(),
      text: <div><ViewBlog id={id} dropdownPreview imageSize={26}/></div>,
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
