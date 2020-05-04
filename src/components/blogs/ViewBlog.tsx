import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { GenericAccountId as AccountId } from '@polkadot/types';
import IdentityIcon from '@polkadot/react-components/IdentityIcon';
import Error from 'next/error'
import { HeadMeta } from '../utils/HeadMeta';
import { ZERO } from '../utils/index';
import { nonEmptyStr } from '@subsocial/utils'
import { ViewPostPage } from '../posts/ViewPost';
import { BlogFollowersModal } from '../profiles/AccountsListModal';
// import { BlogHistoryModal } from '../utils/ListsEditHistory';
import { Segment } from 'semantic-ui-react';
import { formatUnixDate, getBlogId } from '../utils/utils';
import { MutedSpan, MutedDiv } from '../utils/MutedText';
import NoData from '../utils/EmptyList';
import ListData from '../utils/DataList';
import { Button, Icon, Menu, Dropdown } from 'antd';
import { DfBgImg } from '../utils/DfBgImg';
import { Pluralize } from '../utils/Plularize';
import Section from '../utils/Section';
import { isBrowser } from 'react-device-detect';
import { NextPage } from 'next';
import { isMyAddress } from '../utils/MyAccountContext';
import BN from 'bn.js';
import mdToText from 'markdown-to-txt';
import SpaceNav from './SpaceNav'
import { BlogContent } from '@subsocial/types/offchain';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import ViewTags from '../utils/ViewTags';
import Name from '../profiles/address-views/Name';
import MyEntityLabel from '../utils/MyEntityLabel';
import { SummarizeMd } from '../utils/md';
import { blogUrl, editBlogUrl } from '../utils/urls';
import { ViewBlogProps } from './ViewBlogProps';
import withLoadBlogDataById from './withLoadBlogDataById';

const FollowBlogButton = dynamic(() => import('../utils/FollowBlogButton'), { ssr: false });

// TODO get rid of this 'hack'
const SUB_SIZE = 2;

export const ViewBlogPage: NextPage<ViewBlogProps> = (props) => {
  if (props.statusCode === 404) return <Error statusCode={props.statusCode} />

  const { blogData } = props;

  if (!blogData || !blogData?.struct) return <NoData description={<span>Blog not found</span>} />;

  const {
    preview = false,
    nameOnly = false,
    withLink = false,
    miniPreview = false,
    previewDetails = false,
    withFollowButton = false,
    dropdownPreview = false,
    posts = [],
    imageSize = 36,
    onClick,
    owner
  } = props;

  const blog = blogData.struct;

  const {
    id,
    score,
    created: { account, time },
    posts_count,
    followers_count: followers
  } = blog;

  const [ content ] = useState(blogData?.content || {} as BlogContent);
  const { desc, name, image, tags } = content;
  const [ followersOpen, setFollowersOpen ] = useState(false);

  const isMyBlog = isMyAddress(account);
  const hasImage = nonEmptyStr(image);
  const postsCount = new BN(posts_count).eq(ZERO) ? 0 : new BN(posts_count);

  const renderDropDownMenu = () => {
    const menu =
      <Menu>
        {isMyBlog && <Menu.Item key='0'>
          <Link href={`/blogs/[id]/edit`} as={editBlogUrl(blog)}>
            <a className='item'>Edit</a>
          </Link>
        </Menu.Item>}
        {/* {edit_history.length > 0 && <Menu.Item key='1'>
          <div onClick={() => setOpen(true)} >View edit history</div>
        </Menu.Item>} */}
      </Menu>

    return <>
      {isMyBlog &&
        <Dropdown overlay={menu} placement='bottomRight'>
          <Icon type='ellipsis' />
        </Dropdown>
      }
      {/* open && <BlogHistoryModal id={id} open={open} close={close} /> */}
    </>
  };

  const NameAsLink = () =>
    <Link href='/blogs/[blogId]' as={blogUrl(blog)}>
      <a>{name}</a>
    </Link>

  const renderNameOnly = () =>
    withLink
      ? <NameAsLink />
      : <span>{name}</span>

  const renderDropDownPreview = () =>
    <div className={`ProfileDetails DfPreview ${isMyBlog && 'MyBlog'}`}>
      {hasImage
        ? <DfBgImg className='DfAvatar' size={imageSize} src={image} style={{ border: '1px solid #ddd' }} rounded/>
        : <IdentityIcon className='image' value={account} size={imageSize - SUB_SIZE} />
      }
      <div className='content'>
        <div className='handle'>{name}</div>
      </div>
    </div>

  const renderMiniPreview = () =>
    <div className={'viewblog-minipreview'}>
      <div onClick={onClick} className={`ProfileDetails ${isMyBlog && 'MyBlog'}`}>
        {hasImage
          ? <DfBgImg className='DfAvatar space' size={imageSize} src={image} style={{ border: '1px solid #ddd' }} rounded/>
          : <IdentityIcon className='image' value={account} size={imageSize - SUB_SIZE} />
        }
        <div className='content'>
          <div className='handle'>{name}</div>
        </div>
      </div>
      {withFollowButton && <FollowBlogButton blogId={id} />}
    </div>

  const renderPreview = () =>
    <div className={`ProfileDetails ${isMyBlog && 'MyBlog'}`}>
      <div className='DfBlogBody'>
        {hasImage
          ? <DfBgImg className='DfAvatar space' size={imageSize} src={image} rounded/>
          : <IdentityIcon className='image' value={account} size={imageSize - SUB_SIZE} />
        }
        <div className='content'>
          <span className='header DfBlogTitle'>
            <span><NameAsLink /></span>
            <MyEntityLabel isMy={isMyBlog}>My blog</MyEntityLabel>
            {!previewDetails && renderDropDownMenu()}
          </span>

          {nonEmptyStr(desc) &&
            <div className='description'>
              <SummarizeMd md={desc} />
            </div>
          }

          <ViewTags tags={tags} />
          {!previewDetails && <RenderBlogCreator />}
          {previewDetails && renderPreviewExtraDetails()}
        </div>
      </div>
      {withFollowButton && <FollowBlogButton blogId={id} />}
    </div>

  const renderBlogFollowersLink = () => {
    const className = 'DfStatItem DfGreyLink ' + (!followers && 'disable')
    return (
      <div onClick={() => setFollowersOpen(true)} className={className}>
        <Pluralize count={followers} singularText='Follower'/>
      </div>
    )
  }

  const renderPreviewExtraDetails = () =>
    <div className={`DfBlogStats ${isMyBlog && 'MyBlog'}`}>
      <Link href='/blogs/[blogId]' as={blogUrl(blog)}>
        <a className={'DfStatItem ' + (!postsCount && 'disable')}>
          <Pluralize count={postsCount} singularText='Post'/>
        </a>
      </Link>

      {renderBlogFollowersLink()}

      <MutedSpan className='DfStatItem'><Pluralize count={score} singularText='Point' /></MutedSpan>

      <MutedSpan>{renderDropDownMenu()}</MutedSpan>

      {followersOpen &&
        <BlogFollowersModal
          id={id}
          title={<Pluralize count={followers} singularText='Follower'/>}
          accountsCount={blog.followers_count}
          open={followersOpen}
          close={() => setFollowersOpen(false)}
        />}
    </div>

  if (nameOnly) {
    return renderNameOnly();
  } else if (dropdownPreview) {
    return renderDropDownPreview();
  } else if (miniPreview) {
    return renderMiniPreview();
  } else if (preview || previewDetails) {
    return <Segment>{renderPreview()}</Segment>;
  }

  const renderPostPreviews = () =>
    <ListData
      title={postsSectionTitle()}
      dataSource={posts}
      noDataDesc='No posts yet'
      noDataExt={isMyBlog
        // TODO replace with Next Link + URL builder
        ? <Button href={`/blogs/${id}/posts/new`}>Create post</Button>
        : null
      }
      renderItem={(item) =>
        <ViewPostPage
          key={item.post.struct.id.toString()}
          variant='preview'
          postData={item.post}
          postExtData={item.ext}
          owner={item.owner}
        />
      }
    />

  const NewPostButton = () => isMyBlog
    // TODO replace with Next Link + URL builder
    ? <Button href={`/blogs/${id}/posts/new`} icon='plus' size='small' className='DfGreyButton'>New post</Button>
    : null

  const postsSectionTitle = () =>
    <div className='DfSection--withButton'>
      <span style={{ marginRight: '1rem' }}>
        <Pluralize count={postsCount} singularText='Post'/>
      </span>
      {posts.length > 0 && <NewPostButton />}
    </div>

  const RenderBlogCreator = () =>
    <MutedDiv className='DfCreator'>
      <div className='DfCreator--data'>
        <Icon type='calendar' />
        Created on {formatUnixDate(time)}
      </div>
      <div className='DfCreator-owner'>
        <Icon type='user' />
        {'Owned by '}
        <Name
          className='DfGreyLink'
          address={account}
          owner={owner}
          isShort={true}
        />
      </div>
    </MutedDiv>

  return <div className='ViewBlogWrapper'>
    {isBrowser && <SpaceNav
      {...content}
      blogId={new BN(id)}
      creator={account}
    />}
    <Section className='DfContentPage'>
      <HeadMeta title={name} desc={mdToText(desc)} image={image} />
      <div className='FullProfile'>
        {renderPreview()}
      </div>
      <div className='DfSpacedButtons'>
        <FollowBlogButton blogId={id} />
        {renderBlogFollowersLink()}
      </div>

      {followersOpen &&
        <BlogFollowersModal
          id={id}
          title={<Pluralize count={followers} singularText='Follower' />}
          accountsCount={blog.followers_count}
          open={followersOpen}
          close={() => setFollowersOpen(false)}
        />
      }

      {renderPostPreviews()}
    </Section>
  </div>
}

ViewBlogPage.getInitialProps = async (props): Promise<any> => {
  const { res, query: { blogId } } = props
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial;
  const idOrHandle = blogId as string

  const return404 = () => {
    if (res) {
      res.statusCode = 404
    }
    return { statusCode: 404 }
  }

  const id = await getBlogId(idOrHandle)
  if (!id) {
    return return404()
  }

  const blogData = id && await subsocial.findBlog(id)
  if (!blogData?.struct) {
    return return404()
  }

  const ownerId = blogData?.struct.created.account as AccountId;
  const owner = await subsocial.findProfile(ownerId);

  const postIds = await substrate.postIdsByBlogId(id as BN)
  const posts = await subsocial.findPostsWithDetails(postIds.reverse());

  return {
    blogData,
    posts,
    owner
  };
};

export default ViewBlogPage

export const ViewBlog = withLoadBlogDataById(ViewBlogPage)
