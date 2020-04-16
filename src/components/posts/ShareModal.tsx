import React from 'react';

import { withCalls, withMulti } from '@polkadot/react-api';
import { socialQueryToProp } from '../utils/index';
import { Modal, Button } from 'semantic-ui-react';
import { withMyAccount, MyAccountProps } from '../utils/MyAccount';
import { ViewPost } from './ViewPost';
import Link from 'next/link';
import { Loading } from '../utils/utils';
import { LabeledValue } from 'antd/lib/select';
import SelectBlogPreview from '../utils/SelectBlogPreview';
import BN from 'bn.js';
// import dynamic from 'next/dynamic';

// const NewSharePost = dynamic(() => import('./EditPost').then((mod: any) => mod.NewSharePost), { ssr: false });

type Props = MyAccountProps & {
  postId: BN,
  open: boolean,
  close: () => void,
  blogIds?: BN[]
};

const InnerShareModal = (props: Props) => {
  const { open, close, postId, blogIds } = props;

  if (!blogIds) return <Loading />;

  // const [ blogId, setBlogId ] = useState(blogIds[0]);
  // const extension = new PostExtension({ SharedPost: new SharedPost(postId) });

  const renderShareView = () => {
    if (blogIds.length === 0) {
      return (
        <Link href='/blogs/new'><a className='ui button primary'>Create your first blog</a></Link>
      );
    }

    const saveBlog = (value: string | number | LabeledValue) => {
      // setBlogId(new BN(value as string));
    };

    return (<div className='DfShareModal'>
      <SelectBlogPreview
        blogIds={blogIds}
        onSelect={saveBlog}
        imageSize={24}
        defaultValue={blogIds[0].toString()} />
        {/*
      <NewSharePost
        blogId={blogId}
        extention={extension}
      />
        */}
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
        {/*
          <NewSharePost
            blogId={blogId}
            extention={extension}
            onlyTxButton
          />
        */}
      </Modal.Actions>
    </Modal>
  );
};

export const ShareModal = withMulti(
  InnerShareModal,
  withMyAccount,
  withCalls<Props>(
    socialQueryToProp(`blogIdsByOwner`, { paramName: 'myAddress', propName: 'blogIds' })
  )
);