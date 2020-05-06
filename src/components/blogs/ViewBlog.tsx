import IdentityIcon from '@polkadot/react-components/IdentityIcon';
import { GenericAccountId as AccountId } from '@polkadot/types';
import { BlogContent } from '@subsocial/types/offchain';
import { nonEmptyStr } from '@subsocial/utils';
import { Button, Dropdown, Icon, Menu } from 'antd';
import BN from 'bn.js';
import mdToText from 'markdown-to-txt';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Error from 'next/error';
import Link from 'next/link';
import React, { useState } from 'react';
import { isBrowser } from 'react-device-detect';
import { Segment } from 'semantic-ui-react';

import { ViewPostPage } from '../posts/ViewPost';
import { ZERO } from '../utils';
import ListData from '../utils/DataList';
import { DfBgImg } from '../utils/DfBgImg';
import NoData from '../utils/EmptyList';
import { HeadMeta } from '../utils/HeadMeta';
import { SummarizeMd } from '../utils/md';
import { isMyAddress } from '../utils/MyAccountContext';
import MyEntityLabel from '../utils/MyEntityLabel';
import { return404 } from '../utils/next';
import { Pluralize } from '../utils/Plularize';
import Section from '../utils/Section';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import { editBlogUrl } from '../utils/urls';
import { getBlogId } from '../utils/utils';
import ViewTags from '../utils/ViewTags';
import BlogStatsRow from './BlogStatsRow';
import SpaceNav from './SpaceNav';
import { ViewBlogProps } from './ViewBlogProps';
import withLoadBlogDataById from './withLoadBlogDataById';
import AboutBlogLink from './AboutBlogLink';
import ViewBlogLink from './ViewBlogLink';

// import { BlogHistoryModal } from '../utils/ListsEditHistory';
const FollowBlogButton = dynamic(() => import('../utils/FollowBlogButton'), { ssr: false });

// TODO get rid of this 'hack'
const SUB_SIZE = 2;

type Props = ViewBlogProps

export const ViewBlogPage: NextPage<Props> = (props) => {
  if (props.statusCode === 404) return <Error statusCode={props.statusCode} />

  const { blogData } = props;

  if (!blogData || !blogData?.struct) {
    return <NoData description={<span>Blog not found</span>} />
  }

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
    onClick
  } = props;

  const blog = blogData.struct;

  const {
    id,
    created: { account },
    posts_count
  } = blog;

  const [ content ] = useState(blogData?.content || {} as BlogContent);
  const { desc, name, image, tags } = content;

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

  const BlogNameAsLink = () =>
    <ViewBlogLink blog={blog} title={name} />

  const renderNameOnly = () =>
    withLink
      ? <BlogNameAsLink />
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
            <BlogNameAsLink />
            <MyEntityLabel isMy={isMyBlog}>My blog</MyEntityLabel>
            {!previewDetails && renderDropDownMenu()}
          </span>

          {nonEmptyStr(desc) &&
            <div className='description'>
              <SummarizeMd md={desc} more={
                <AboutBlogLink blog={blog} title={'Learn More'} />
              } />
            </div>
          }

          <ViewTags tags={tags} />
          {previewDetails && <BlogStatsRow blog={blog} />}
        </div>
      </div>
      {withFollowButton && <FollowBlogButton blogId={id} />}
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

  // TODO extract WithSpaceNav

  return <div className='ViewBlogWrapper'>
    {isBrowser &&
      <SpaceNav
        {...content}
        blogId={new BN(id)}
        creator={account}
      />
    }
    <HeadMeta title={name} desc={mdToText(desc)} image={image} />
    <Section className='DfContentPage'>
      {renderPostPreviews()}
    </Section>
  </div>
}

// TODO extract getInitialProps, this func is similar in AboutBlog

ViewBlogPage.getInitialProps = async (props): Promise<Props> => {
  const { query: { blogId } } = props
  const idOrHandle = blogId as string

  const id = await getBlogId(idOrHandle)
  if (!id) {
    return return404(props)
  }

  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial

  const blogData = id && await subsocial.findBlog(id)
  if (!blogData?.struct) {
    return return404(props)
  }

  const ownerId = blogData?.struct.created.account as AccountId
  const owner = await subsocial.findProfile(ownerId)

  const postIds = await substrate.postIdsByBlogId(id as BN)
  const posts = await subsocial.findPostsWithDetails(postIds.reverse())

  return {
    blogData,
    posts,
    owner
  }
}

export default ViewBlogPage

export const ViewBlog = withLoadBlogDataById(ViewBlogPage)
