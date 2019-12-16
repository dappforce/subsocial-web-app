import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

import { Option, AccountId } from '@polkadot/types';
import IdentityIcon from '@polkadot/ui-app/IdentityIcon';

import { getJsonFromIpfs } from '../../../components/utils/OffchainUtils';
import { nonEmptyStr, SeoHeads } from '../../../components/utils/index';
import { BlogId, Blog, PostId, BlogData } from '../../../components/types';
import { ViewPost } from '../../../components/posts/ViewPost';
import { BlogFollowersModal } from '../../../components/profiles/AccountsListModal';
import { BlogHistoryModal } from '../../../components/utils/ListsEditHistory';
import { Segment } from 'semantic-ui-react';
import { FollowBlogButton } from '../../../components/utils/FollowButton';
import { Loading } from '../../../components/utils/utils';
import { MutedSpan, MutedDiv } from '../../../components/utils/MutedText';
import ListData, { NoData } from '../../../components/utils/DataList';
import { Tag, Button, Icon, Menu, Dropdown } from 'antd';
import { DfBgImg } from '../../../components/utils/DfBgImg';
import { Pluralize } from '../../../components/utils/Plularize';
import AddressMiniDf from '../../../components/utils/AddressMiniDf';
import Section from '../../../components/utils/Section';
import { isBrowser } from 'react-device-detect';
import { NextPage } from 'next';
import Api from '../../../components/utils/serverConnect';
import { useMyAccount } from '../../../components/utils/MyAccountContext';
const SUB_SIZE = 2;

type Props = {
  preview?: boolean,
  nameOnly?: boolean,
  dropdownPreview?: boolean,
  withLink?: boolean,
  miniPreview?: boolean,
  previewDetails?: boolean,
  withFollowButton?: boolean,
  id?: BlogId,
  blogById?: Option<Blog>,
  postIds?: PostId[],
  followers?: AccountId[],
  imageSize?: number,
  onClick?: () => void
};

const Component: NextPage<Props> = (props: Props) => {
  const { blogById } = props;

  if (blogById === undefined) return <Loading />;
  else if (blogById.isNone) return <NoData description={<span>Blog not found</span>} />;
  const blog = blogById.unwrap();

  const {
    preview = false,
    nameOnly = false,
    withLink = false,
    miniPreview = false,
    previewDetails = false,
    withFollowButton = false,
    dropdownPreview = false,
    postIds = [],
    imageSize = 36,
    onClick,
  } = props;

  const {
    id,
    score,
    created: { account, time },
    ipfs_hash,
    followers_count: followers,
    edit_history
  } = blog;

  const { state: { address } } = useMyAccount();
  const myAddress = address;
  const [content, setContent] = useState({} as BlogData);
  const { desc, name, image } = content;

  const [followersOpen, setFollowersOpen] = useState(false);

  useEffect(() => {
    if (!ipfs_hash) return;
    let isSubscribe = true;

    getJsonFromIpfs<BlogData>(ipfs_hash).then(json => {
      const content = json;
      if (isSubscribe) setContent(content);
    }).catch(err => console.log(err));

    return () => { isSubscribe = false; };
  }, [ false ]);

  const isMyBlog = myAddress && account && myAddress === account.toString();
  const hasImage = image && nonEmptyStr(image);
  const postsCount = postIds ? postIds.length : 0;

  const renderDropDownMenu = () => {

    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    const showDropdown = isMyBlog || edit_history.length > 0;

    const menu = (
      <Menu>
        {isMyBlog && <Menu.Item key='0'>
          <Link href={`/blog/edit/[id]`} as={`/blog/edit/${id.toString()}`}><a className='item'>Edit</a></Link>
        </Menu.Item>}
        {edit_history.length > 0 && <Menu.Item key='1'>
          <div onClick={() => setOpen(true)} >View edit history</div>
        </Menu.Item>}
      </Menu>
    );

    return (showDropdown && <>
    <Dropdown overlay={menu} placement='bottomRight'>
      <Icon type='ellipsis' />
    </Dropdown>
    {open && <BlogHistoryModal id={id} open={open} close={close} />}
    </>);
  };

  const NameAsLink = () => <Link href='/blog/[blogId]' as={`/blog/${id}`}><a>{name}</a></Link>;

  const renderNameOnly = () => {
    return withLink
      ? <NameAsLink />
      : <span>{name}</span>;
  };

  const renderDropDownPreview = () => (
    <div className={`item ProfileDetails DfPreview ${isMyBlog && 'MyBlog'}`}>
      {hasImage
        ? <DfBgImg className='DfAvatar' size={imageSize} src={image} style={{ border: '1px solid #ddd' }} rounded/>
        : <IdentityIcon className='image' value={account} size={imageSize - SUB_SIZE} />
      }
      <div className='content'>
        <div className='handle'>{name}</div>
      </div>
    </div>
  );

  const renderMiniPreview = () => (
    <div onClick={onClick} className={`item ProfileDetails ${isMyBlog && 'MyBlog'}`}>
      {hasImage
        ? <DfBgImg className='DfAvatar' size={imageSize} src={image} style={{ border: '1px solid #ddd' }} rounded/>
        : <IdentityIcon className='image' value={account} size={imageSize - SUB_SIZE} />
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
          ? <DfBgImg className='DfAvatar' size={imageSize} src={image} rounded/>
          : <IdentityIcon className='image' value={account} size={imageSize - SUB_SIZE} />
        }
        <div className='content'>
          <span className='header DfBlogTitle'>
            <span><NameAsLink /></span>
            <span>{isMyBlog && isBrowser && <Tag color='green' style={{ marginLeft: '.25rem' }}>My blog</Tag>}</span>
            {!previewDetails && renderDropDownMenu()}
          </span>
          <div className='description'>
            <ReactMarkdown className='DfMd' source={desc} linkTarget='_blank' />
          </div>
          {!previewDetails && <RenderBlogCreator />}
          {previewDetails && renderPreviewExtraDetails()}
        </div>
      </div>
      {withFollowButton && <FollowBlogButton blogId={id} />}
    </div>;
  };

  const renderPreviewExtraDetails = () => {
    return <>
      <div className={`DfBlogStats ${isMyBlog && 'MyBlog'}`}>
        <Link href='/blog/[blogId]' as={`/blog/${id}`}>
          <a className={'DfStatItem ' + (!postsCount && 'disable')}>
          <Pluralize count={postsCount} singularText='Post'/>
          </a>
        </Link>

        <div onClick={() => setFollowersOpen(true)} className={'DfStatItem DfGreyLink ' + (!followers && 'disable')}>
          <Pluralize count={followers} singularText='Follower'/>
        </div>

        <MutedSpan className='DfStatItem'><Pluralize count={score.toNumber()} singularText='Point' /></MutedSpan>

        <MutedSpan>{renderDropDownMenu()}</MutedSpan>

        {followersOpen &&
          <BlogFollowersModal
            id={id}
            title={<Pluralize count={followers} singularText='Follower'/>}
            accountsCount={blog.followers_count.toNumber()}
            open={followersOpen}
            close={() => setFollowersOpen(false)}
          />}
      </div>
    </>;
  };

  if (nameOnly) {
    return renderNameOnly();
  } else if (dropdownPreview) {
    return renderDropDownPreview();
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
      noDataDesc='No posts yet'
      noDataExt={<Button href={`/new?blogId=${id}`}>Create post</Button>}
    />;
  };
  const NewPostButton = () => <Button href={`/blog/new?blogId=${id}`} icon='plus' size='small' className='DfGreyButton'>New post</Button>;

  const postsSectionTitle = () => {
    return <div className='DfSection--withButton'>
      <span style={{ marginRight: '1rem' }}>{<Pluralize count={postsCount} singularText='Post'/>}</span>
      {postIds.length ? <NewPostButton /> : null}
    </div>;
  };

  const RenderBlogCreator = () => (
    <MutedDiv className='DfCreator'>
      <div className='DfCreator--data'><Icon type='calendar' />Created on {time}</div>
      <div className='DfCreator-owner'>
        <Icon type='user' />
        {'Owned by '}
        <AddressMiniDf
          className='DfGreyLink'
          value={account}
          isShort={true}
          isPadded={false}
          size={30}
          onlyUserName
        />
      </div>
    </MutedDiv>
  );

  return <Section className='DfContentPage'>
    <SeoHeads title={name} name={name} desc={desc} image={image} />
    <div className='FullProfile'>
      {renderPreview()}
    </div>
    <div className='DfSpacedButtons'>
      <FollowBlogButton blogId={id} />
      <div onClick={() => setFollowersOpen(true)} className={'DfStatItem DfGreyLink ' + (!followers && 'disable')}>
          <Pluralize count={followers} singularText='Follower'/>
      </div>
    </div>

    {followersOpen && <BlogFollowersModal id={id} accountsCount={blog.followers_count.toNumber()} open={followersOpen} close={() => setFollowersOpen(false)} title={<Pluralize count={followers} singularText='Follower'/>} />}
    {renderPostPreviews()}
  </Section>;
};

Component.getInitialProps = async (props): Promise<any> => {
  const { query: { blogId } } = props;
  console.log('Initial', props.query);
  const api = await Api.setup();
  const blogIdOpt = await api.query.blogs.blogById(blogId) as Option<Blog>;
  const postIds = await api.query.blogs.postIdsByBlogId(blogId) as unknown as PostId[];
  return {
    blogById: blogIdOpt,
    postIds: postIds
  };
};

export default Component;
