import React, { useState, useEffect } from 'react';
import { withMulti, withCalls } from '@polkadot/ui-api/with';
import { Modal, Comment as SuiComment, Button } from 'semantic-ui-react';
import { Post, Blog, PostId, PostContent, BlogContent, BlogId, CommentId, CommentContent, Comment, OptionComment, BlogHistoryRecord, CommentHistoryRecord, PostHistoryRecord, VecBlogHistoryRecord, VecPostHistoryRecord, ProfileHistoryRecord, ProfileContent, Profile, VecProfileHistoryRecord, SocialAccount, OptionText } from '../types';
import { queryBlogsToProp } from './index';
import { Option, AccountId } from '@polkadot/types';
import { DfMd } from './DfMd';
import IdentityIcon from '@polkadot/ui-identicon/Identicon';
import Link from 'next/link';
import { CreatedBy } from './CreatedBy';
import { getJsonFromIpfs } from './OffchainUtils';
import { withRequireProfile, withSocialAccount, Loading } from './utils';
import { NoData } from './DataList';
import { DfBgImg } from './DfBgImg';
import dynamic from 'next/dynamic';

const AddressComponents = dynamic(() => import('./AddressComponents'), { ssr: false });

type ModalController = {
  open: boolean,
  close: () => void
};

function fillHistory<T extends (BlogHistoryRecord | ProfileHistoryRecord)[]> (historyLast: T) {
  if (historyLast[0] === undefined) return;

  const stringForSlugOrUsername = historyLast[0] instanceof ProfileHistoryRecord ? 'username' : 'slug';

  const history = [ ...historyLast ];
  let ipfsHash = history[0].old_data.ipfs_hash;
  let slug = history[0].old_data.get(stringForSlugOrUsername) as OptionText;

  if (ipfsHash.isNone) {
    for (let i = 1; i < history.length; i++) {
      if (history[i].old_data.ipfs_hash.isSome) {
        ipfsHash = history[i].old_data.ipfs_hash;
        break;
      }
    }
  }

  if (slug.isNone) {
    for (let i = 1; i < history.length; i++) {
      const _slug = history[i].old_data.get(stringForSlugOrUsername) as OptionText;
      if (_slug.isSome) {
        slug = _slug;
        break;
      }
    }
  }

  return history.map(record => {
    if (record.old_data.ipfs_hash.isNone) {
      record.old_data.ipfs_hash = ipfsHash;
    } else {
      ipfsHash = record.old_data.ipfs_hash;
    }
    const _slug = record.old_data.get(stringForSlugOrUsername) as OptionText;
    if (_slug.isNone) {
      record.old_data.set(stringForSlugOrUsername, slug);
    } else {
      slug = _slug;
    }
    return record;
  }).reverse() as T;
}

function fillHistoryForPost<T extends PostHistoryRecord[]> (historyLast: T) {
  if (historyLast[0] === undefined) return;

  const history = [ ...historyLast ];
  let ipfsHash = history[0].old_data.ipfs_hash;

  if (ipfsHash.isNone) {
    for (let i = 1; i < history.length; i++) {
      if (history[i].old_data.ipfs_hash.isSome) {
        ipfsHash = history[i].old_data.ipfs_hash;
        break;
      }
    }
  }

  return history.map(record => {
    if (record.old_data.ipfs_hash.isNone) {
      record.old_data.ipfs_hash = ipfsHash;
    } else {
      ipfsHash = record.old_data.ipfs_hash;
    }
    return record;
  }).reverse() as T;
}

type PropsCommentFromHistory = {
  history: CommentHistoryRecord
};

const CommentFromHistory = (props: PropsCommentFromHistory) => {
  const { history: { old_data, edited } } = props;
  const { ipfs_hash } = old_data;
  const [ content, setContent ] = useState({} as CommentContent);

  useEffect(() => {
    const loadData = async () => {
      const data = await getJsonFromIpfs<CommentContent>(ipfs_hash.toString());
      setContent(data);
    };
    loadData().catch(err => new Error(err));
  }, [ ipfs_hash ]);

  return (<div className='DfModal'>
    <SuiComment>
      <SuiComment.Metadata>
        <AddressComponents
          value={edited.account}
          isShort={true}
          isPadded={false}
          size={28}
          extraDetails={`${edited.time.toLocaleString()} at block #${edited.block.toNumber()}`}
        />
      </SuiComment.Metadata>
      <SuiComment.Text>{content.body}</SuiComment.Text>
    </SuiComment>
  </div>);
};

type CommentHistoryProps = ModalController & {
  id: CommentId
  commentOpt?: OptionComment
};

const InnerCommentHistoryModal = (props: CommentHistoryProps) => {
  const { open, close, commentOpt } = props;

  if (commentOpt === undefined) return <Modal><Loading /></Modal>;
  else if (commentOpt.isNone) return <Modal><NoData description={<span>Comment not found</span>} /></Modal>;

  const comment = commentOpt.unwrap() as Comment;

  const { edit_history } = comment;

  const renderCommentHistory = () => {
    const commentArrays = edit_history.map((x, index) => <CommentFromHistory history={x} key={index} />);
    return commentArrays.reverse();
  };

  return (
    <Modal
      open={open}
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header>Edit History</Modal.Header>
      <Modal.Content scrolling>
        {edit_history ? renderCommentHistory() : 'No change history'}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={close} />
      </Modal.Actions>
    </Modal>
  );
};

export const CommentHistoryModal = withMulti(
  InnerCommentHistoryModal,
  withCalls<CommentHistoryProps>(
    queryBlogsToProp('commentById', { paramName: 'id', propName: 'commentOpt' })
  )
);

type PropsPostFromHistory = {
  history: PostHistoryRecord,
  current_data: {
    ipfs_hash: string
  }
};

const PostFromHistory = (props: PropsPostFromHistory) => {
  const { history: { old_data, edited }, current_data } = props;
  const { ipfs_hash } = old_data;
  const [ content, setContent ] = useState({} as PostContent);
  const [ ipfsHash, setIpfsHash ] = useState('');

  useEffect(() => {
    ipfs_hash.isNone ? setIpfsHash(current_data.ipfs_hash) : setIpfsHash(ipfs_hash.unwrap().toString());
    const loadData = async () => {
      const data = await getJsonFromIpfs<PostContent>(ipfsHash);
      setContent(data);
    };
    loadData().catch(err => new Error(err));
  }, [ ipfsHash ]);

  return (<div className='DfModal'>
    <h1 style={{ display: 'flex' }}>
      <span style={{ marginRight: '.5rem' }}>{content.title}</span>
    </h1>
    <CreatedBy created={edited} dateLabel='Edited on' accountLabel='Edited by' />
    <div className='DfModal'>
      {content.image && <img src={content.image} className='DfPostImage' /* add onError handler */ />}
      {/* <DfMd source={content.body} /> */}
      {/* TODO render tags */}
    </div>
  </div>);
};

type PostHistoryProps = ModalController & {
  id: PostId,
  postOpt?: Option<Post>
};

const InnerPostHistoryModal = (props: PostHistoryProps) => {
  const { open, close, postOpt } = props;

  if (postOpt === undefined) return <Modal><Loading /></Modal>;
  else if (postOpt.isNone) return <Modal><NoData description={<span>Post not found</span>} /></Modal>;

  const post = postOpt.unwrap();
  const { edit_history } = post;

  const history = fillHistoryForPost<VecPostHistoryRecord>(edit_history);

  const renderPostHistory = () => {
    return history && history.map((x, index) => <PostFromHistory
      history={x}
      key={index}
      current_data={{ ipfs_hash: post.ipfs_hash }}
    />);
  };

  return (
    <Modal
      open={open}
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header>Edit History</Modal.Header>
      <Modal.Content scrolling>
        {history && renderPostHistory()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={close} />
      </Modal.Actions>
    </Modal>
  );
};

export const PostHistoryModal = withMulti(
  InnerPostHistoryModal,
  withCalls<PostHistoryProps>(
    queryBlogsToProp('postById', { paramName: 'id', propName: 'postOpt' })
  )
);

type BlogHistoryProps = ModalController & {
  id: BlogId,
  blogOpt?: Option<Blog>
};

type PropsBlogFromHistory = {
  history: BlogHistoryRecord,
  current_data: {
    ipfs_hash: string,
    slug: string
  }
};

const BlogFromHistory = (props: PropsBlogFromHistory) => {
  const { history: { old_data, edited }, current_data } = props;
  const { ipfs_hash, slug } = old_data;
  const [ content, setContent ] = useState({} as BlogContent);
  const [ ipfsHash, setIpfsHash ] = useState('');
  const [ _slug, setSlug ] = useState('');

  useEffect(() => {
    ipfs_hash.isNone ? setIpfsHash(current_data.ipfs_hash) : setIpfsHash(ipfs_hash.unwrap().toString());
    slug.isNone ? setSlug(current_data.slug) : setSlug(slug.unwrap().toString());
    const loadData = async () => {
      const data = await getJsonFromIpfs<BlogContent>(ipfsHash);
      setContent(data);
    };
    loadData().catch(err => new Error(err));
  }, [ ipfsHash, _slug ]);

  return (<div className='DfModal'>
    <div className='ui massive relaxed middle aligned list FullProfile'>
      <div className={`item ProfileDetails MyBlog`}>
        {content.image
          ? <DfBgImg className='ui avatar image DfAvatar' src={content.image} size={40} rounded/>
          : <IdentityIcon className='image' value={edited.account} size={38} />
        }
        <div className='DfContent'>
          <div className='header DfHistoryTitle'>
            <Link href='#'><a className='handle'>{content.name}</a></Link>
          </div>
          <div className='DfDescription'>{`slug: ${_slug}`}</div>
          <div className='DfDescription'>
            <DfMd source={content.desc} />
          </div>
        </div>
      </div>
    </div>
    <CreatedBy created={edited} dateLabel='Edited on' accountLabel='Edited by' />
  </div>);
};

const InnerBlogHistoryModal = (props: BlogHistoryProps) => {
  const { open, close, blogOpt } = props;

  if (blogOpt === undefined) return <Modal><Loading /></Modal>;
  else if (blogOpt.isNone) return <Modal><NoData description={<span>Blog not found</span>} /></Modal>;

  const blog = blogOpt.unwrap();
  const { edit_history } = blog;

  const history = fillHistory<VecBlogHistoryRecord>(edit_history);

  const renderBlogHistory = () => {
    return history && history.map((x, index) => <BlogFromHistory
      history={x}
      key={index}
      current_data={{ ipfs_hash: blog.ipfs_hash, slug: blog.slug.toString() }}
    />);
  };

  return (
    <Modal
      open={open}
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header>Edit History</Modal.Header>
      <Modal.Content scrolling>
        {edit_history.length > 0 && renderBlogHistory()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={close} />
      </Modal.Actions>
    </Modal>
  );
};

export const BlogHistoryModal = withMulti(
  InnerBlogHistoryModal,
  withCalls<BlogHistoryProps>(
    queryBlogsToProp('blogById', { paramName: 'id', propName: 'blogOpt' })
  )
);

type ProfileHistoryProps = ModalController & {
  id: AccountId,
  socialAccountOpt?: Option<SocialAccount>,
  socailAccount?: SocialAccount,
  profile?: Profile
  ProfileContent: ProfileContent
};

type PropsProfileFromHistory = {
  history: ProfileHistoryRecord,
  current_data: {
    ipfs_hash: string,
    username: string
  }
};

const ProfileFromHistory = (props: PropsProfileFromHistory) => {
  const { history: { old_data, edited }, current_data } = props;
  const { ipfs_hash, username } = old_data;
  const [ content, setContent ] = useState({} as ProfileContent);
  const [ ipfsHash, setIpfsHash ] = useState('');
  const [ _username, setUsername ] = useState(''); // TODO inconsistent naming

  useEffect(() => {
    ipfs_hash.isNone ? setIpfsHash(current_data.ipfs_hash) : setIpfsHash(ipfs_hash.unwrap().toString());
    username.isNone ? setUsername(current_data.username) : setUsername(username.unwrap().toString());
    const loadData = async () => {
      const data = await getJsonFromIpfs<ProfileContent>(ipfsHash);
      setContent(data);
    };
    loadData().catch(err => new Error(err));
  }, [ ipfsHash, _username ]);

  return (<div className='DfModal'>
    <div className='ui massive relaxed middle aligned list FullProfile'>
      <div className={`item ProfileDetails MyBlog`}>
        {content.avatar
          ? <DfBgImg className='ui avatar image DfAvatar' src={content.avatar} size={40} rounded/>
          : <IdentityIcon className='image' value={edited.account} size={38} />
        }
        <div className='content'>
          <div className='header DfHistoryTitle'>
            <Link href='#'><a className='handle'>{content.fullname}</a></Link>
          </div>
          <div className='about' style={{ margin: '0.2rem' }}>{`username: ${_username}`}</div>
          <div className='about' style={{ margin: '0.2rem' }}>
            <DfMd source={content.about} />
          </div>
        </div>
      </div>
    </div>
    <CreatedBy created={edited} dateLabel='Edited on' accountLabel='Edited by' />
  </div>);
};

const InnerProfileHistoryModal = (props: ProfileHistoryProps) => {
  const { open, close, profile } = props;

  if (!profile) return <em>Profile not found</em>;

  const { edit_history } = profile;

  const history = fillHistory<VecProfileHistoryRecord>(edit_history);

  const renderProfileHistory = () => {
    return history && history.map((x, index) => <ProfileFromHistory
      history={x}
      key={index}
      current_data={{ ipfs_hash: profile.ipfs_hash, username: profile.username.toString() }}
    />);
  };

  return (
    <Modal
      open={open}
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header>Edit History</Modal.Header>
      <Modal.Content scrolling>
        {edit_history.length > 0 && renderProfileHistory()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={close} />
      </Modal.Actions>
    </Modal>
  );
};

export const ProfileHistoryModal = withMulti(
  InnerProfileHistoryModal,
  withCalls<ProfileHistoryProps>(
    queryBlogsToProp('socialAccountById',
      { paramName: 'id', propName: 'socialAccountOpt' })
  ),
  withRequireProfile,
  withSocialAccount
);
