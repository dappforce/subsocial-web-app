import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { Option, AccountId } from '@polkadot/types';
import IdentityIcon from '@polkadot/ui-app/IdentityIcon';

import { getJsonFromIpfs } from '../utils/OffchainUtils';
import { nonEmptyStr, queryBlogsToProp, SeoHeads } from '../utils/index';
import { BlogId, Blog, PostId, BlogData } from '../types';
import { MyAccountProps, withMyAccount } from '../utils/MyAccount';
import { ViewPost } from '../posts/ViewPost';
import { CreatedBy } from '../utils/CreatedBy';
import { BlogFollowersModal } from '../profiles/AccountsListModal';
import { BlogHistoryModal } from '../utils/ListsEditHistory';
import { Dropdown, Segment } from 'semantic-ui-react';
import { FollowBlogButton } from '../utils/FollowButton';
import TxButton from '../utils/TxButton';
import { pluralizeText } from '../utils/utils';
import { MutedSpan } from '../utils/MutedText';
import Router from 'next/router';import ListData from '../utils/DataList';
import { Avatar } from 'antd';

type Props = MyAccountProps & {
  preview?: boolean,
  nameOnly?: boolean,
  withLink?: boolean,
  miniPreview?: boolean,
  previewDetails?: boolean,
  withFollowButton?: boolean,
  id: BlogId,
  blogById?: Option<Blog>,
  postIds?: PostId[],
  followers?: AccountId[],
  imageSize?: number
};

function Component(props: Props) {
  const { blogById } = props;

  if (blogById === undefined) return <em>Loading...</em>;
  else if (blogById.isNone) return <em>Blog not found</em>;

  const {
    preview = false,
    nameOnly = false,
    withLink = false,
    miniPreview = false,
    previewDetails = false,
    withFollowButton = false,
    myAddress,
    postIds = [],
    imageSize = 36
  } = props;

  const blog = blogById.unwrap();
  const {
    id,
    score,
    created: { account },
    ipfs_hash,
    followers_count
  } = blog;
  const followers = followers_count.toNumber();
  const [content, setContent] = useState({} as BlogData);
  const { desc, name, image } = content;

  const [followersOpen, setFollowersOpen] = useState(false);

  useEffect(() => {
    if (!ipfs_hash) return;
    getJsonFromIpfs<BlogData>(ipfs_hash).then(json => {
      const content = json;
      setContent(content);
    }).catch(err => console.log(err));
  }, [id]);

  const isMyBlog = myAddress && account && myAddress === account.toString();
  const hasImage = image && nonEmptyStr(image);
  const postsCount = postIds ? postIds.length : 0;

  const renderDropDownMenu = () => {

    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (<Dropdown icon='ellipsis horizontal'>
      <Dropdown.Menu>
        {isMyBlog && <Link href={`/edit-blog?id=${id.toString()}`}><a className='item'>Edit</a></Link>}
        <Dropdown.Item text='View edit history' onClick={() => setOpen(true)} />
        {open && <BlogHistoryModal id={id} open={open} close={close} />}
      </Dropdown.Menu>
    </Dropdown>);
  };

  const NameAsLink = () => <Link href={`/blog?id=${id}`}><a className='handle'>{name}</a></Link>;

  const renderNameOnly = () => {
    return withLink
      ? <NameAsLink />
      : <>{name}</>;
  };

  const renderMiniPreview = () => (
    <div onClick={() => Router.push(`/blog?id=${id}`)} className={`item ProfileDetails asLink ${isMyBlog && 'MyBlog'}`}>
      {hasImage
        ? <Avatar size={imageSize} src={image} />
        : <IdentityIcon className='image' value={account} size={imageSize} />
      }
      <div className='content'>
        <div className='handle'>{name}</div>
      </div>
    </div>
  );

  const renderPreview = () => {
    return <div className={`item ProfileDetails ${isMyBlog && 'MyBlog'}`}>
      <div className='DfBlogBody'>
        {hasImage
          ? <Avatar size={imageSize} src={image} />
          : <IdentityIcon className='image' value={account} size={imageSize} />
        }
        <div className='content'>
          <div className='header'>
            <NameAsLink />
            {renderDropDownMenu()}
          </div>
          <div className='description'>
            <ReactMarkdown className='DfMd' source={desc} linkTarget='_blank' />
          </div>
          {previewDetails && renderPreviewExtraDetails()}
        </div>
      </div>
      {withFollowButton && <FollowBlogButton blogId={id} />}
    </div>;
  };

  const renderPreviewExtraDetails = () => {
    return <>
      <div className={`DfBlogStats ${isMyBlog && 'MyBlog'}`}>
        <Link href={`/blog?id=${id}`}>
          <a className={'DfStatItem ' + (!postsCount && 'disable')}>
            {pluralizeText(postsCount, 'Post')}
          </a>
        </Link>

        <div onClick={() => setFollowersOpen(true)} className={'DfStatItem ' + (!followers && 'disable')}>
          {pluralizeText(followers, 'Follower')}
        </div>

        <MutedSpan className='DfStatItem'>Score: {score.toNumber()}</MutedSpan>

        {followersOpen &&
          <BlogFollowersModal
            id={id}
            title={pluralizeText(followers, 'Follower')}
            accountsCount={blog.followers_count.toNumber()}
            open={followersOpen}
            close={() => setFollowersOpen(false)}
          />}
      </div>
    </>;
  };

  if (nameOnly) {
    return renderNameOnly();
  } else if (miniPreview) {
    return renderMiniPreview();
  } else if (preview || previewDetails) {
    return <Segment>{renderPreview()}</Segment>;
  }

  const renderPostPreviews = () => {
    return <ListData
      title={postsSectionTitle()}
      dataSource={postIds}
      renderItem={(id, index) =>
        <ViewPost key={index} id={id} preview />}
    />;
  };
  const NewPostButton = () => <Link href={`/new-post?blogId=${id}`}>
    <a className='ui tiny button'>
      <i className='plus icon' />
      Write post
    </a>
  </Link>;

  const postsSectionTitle = () => {
    return <div>
      <span style={{ marginRight: '.5rem' }}>{pluralizeText(postsCount, 'Post')}</span>
      <NewPostButton />
    </div>;
  };

  return <div>
    <SeoHeads title={name} name={name} desc={desc} image={image} />
    <div className='ui massive relaxed middle aligned list FullProfile'>
      {renderPreview()}
    </div>
    <CreatedBy created={blog.created} />

    <div className='DfSpacedButtons'>
      <FollowBlogButton blogId={id} />
      <TxButton size='small' isBasic={true} isPrimary={false} onClick={() => setFollowersOpen(true)} isDisabled={followers === 0}>{pluralizeText(followers, 'Follower')}</TxButton>
    </div>

    {followersOpen && <BlogFollowersModal id={id} accountsCount={blog.followers_count.toNumber()} open={followersOpen} close={() => setFollowersOpen(false)} title={pluralizeText(followers, 'Follower')} />}
    {renderPostPreviews()}
  </div>;
}

export default withMulti(
  Component,
  withMyAccount,
  withCalls<Props>(
    queryBlogsToProp('blogById', 'id'),
    queryBlogsToProp('postIdsByBlogId', { paramName: 'id', propName: 'postIds' })
  )
);
