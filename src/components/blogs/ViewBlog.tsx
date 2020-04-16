import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { DfMd } from '../utils/DfMd';
import { Option, GenericAccountId as AccountId } from '@polkadot/types';
import IdentityIcon from '@polkadot/react-components/IdentityIcon';
import Error from 'next/error'
import { useSubsocialApi } from '../utils/SubsocialApiContext'
import { HeadMeta } from '../utils/HeadMeta';
import { ZERO } from '../utils/index';
import { nonEmptyStr, newLogger } from '@subsocial/utils'
import { ViewPostPage } from '../posts/ViewPost';
import { BlogFollowersModal } from '../profiles/AccountsListModal';
// import { BlogHistoryModal } from '../utils/ListsEditHistory';
import { Segment } from 'semantic-ui-react';
import { Loading, formatUnixDate, getBlogId } from '../utils/utils';
import { MutedSpan, MutedDiv } from '../utils/MutedText';
import NoData from '../utils/EmptyList';
import ListData from '../utils/DataList';
import { Tag, Button, Icon, Menu, Dropdown } from 'antd';
import { DfBgImg } from '../utils/DfBgImg';
import { Pluralize } from '../utils/Plularize';
import Section from '../utils/Section';
import { isBrowser } from 'react-device-detect';
import { NextPage } from 'next';
import { useMyAccount } from '../utils/MyAccountContext';
import BN from 'bn.js';
import mdToText from 'markdown-to-txt';
import SpaceNav from './SpaceNav'
import '../utils/styles/wide-content.css'
import { BlogContent } from '@subsocial/types/offchain';
import { Blog } from '@subsocial/types/substrate/interfaces';
import { BlogData, ExtendedPostData } from '@subsocial/types/dto'
import { getSubsocialApi } from '../utils/SubsocialConnect';
import ViewTags from '../utils/ViewTags';

const log = newLogger('View blog')

const FollowBlogButton = dynamic(() => import('../utils/FollowBlogButton'), { ssr: false });
const AddressComponents = dynamic(() => import('../utils/AddressComponents'), { ssr: false });

const SUB_SIZE = 2;

type Props = {
  preview?: boolean,
  nameOnly?: boolean,
  dropdownPreview?: boolean,
  withLink?: boolean,
  miniPreview?: boolean,
  previewDetails?: boolean,
  withFollowButton?: boolean,
  id?: BN,
  blogData?: BlogData,
  blogById?: Option<Blog>,
  posts?: ExtendedPostData[],
  followers?: AccountId[],
  imageSize?: number,
  onClick?: () => void,
  statusCode?: number
};

export const ViewBlogPage: NextPage<Props> = (props: Props) => {
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
    onClick
  } = props;

  const blog = blogData.struct;

  const {
    id,
    score,
    created: { account, time },
    ipfs_hash,
    posts_count,
    followers_count: followers,
    edit_history
  } = blog;

  const { state: { address } } = useMyAccount();
  const { ipfs } = useSubsocialApi()
  const [ content, setContent ] = useState(blogData.content as BlogContent);
  const { desc, name, image, tags } = content;
  const [ followersOpen, setFollowersOpen ] = useState(false);

  useEffect(() => {
    if (!ipfs_hash) return;
    let isSubscribe = true;

    ipfs.findBlog(ipfs_hash).then((json) => {
      const content = json;
      if (isSubscribe && content) setContent(content);
    }).catch((err) => log.error('Failed to find blog in IPFS:', err));

    return () => { isSubscribe = false; };
  }, [ false ]);

  const isMyBlog = address && account && address === account.toString();
  const hasImage = image && nonEmptyStr(image);
  const postsCount = new BN(posts_count).eq(ZERO) ? 0 : new BN(posts_count);

  const renderDropDownMenu = () => {
    const showDropdown = isMyBlog || edit_history.length > 0;

    const menu = (
      <Menu>
        {isMyBlog && <Menu.Item key='0'>
          <Link href={`/blogs/[id]/edit`} as={`/blogs/${id.toString()}/edit`}><a className='item'>Edit</a></Link>
        </Menu.Item>}
        {/* {edit_history.length > 0 && <Menu.Item key='1'>
          <div onClick={() => setOpen(true)} >View edit history</div>
        </Menu.Item>} */}
      </Menu>
    );

    return (showDropdown && <>
      <Dropdown overlay={menu} placement='bottomRight'>
        <Icon type='ellipsis' />
      </Dropdown>
      {/* open && <BlogHistoryModal id={id} open={open} close={close} /> */}
    </>);
  };

  const NameAsLink = () => <Link href='/blogs/[blogId]' as={`/blogs/${id}`}><a>{name}</a></Link>;

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
    <div className={'viewblog-minipreview'}>
      <div onClick={onClick} className={`item ProfileDetails ${isMyBlog && 'MyBlog'}`}>
        {hasImage
          ? <DfBgImg className='DfAvatar' size={imageSize} src={image} style={{ border: '1px solid #ddd' }} rounded/>
          : <IdentityIcon className='image' value={account} size={imageSize - SUB_SIZE} />
        }
        <div className='content'>
          <div className='handle'>{name}</div>
        </div>
      </div>
      {withFollowButton && <FollowBlogButton blogId={id} />}
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
            {isMyBlog && isBrowser && <Tag color='green' style={{ marginLeft: '.5rem' }}>My blog</Tag>}
            {!previewDetails && renderDropDownMenu()}
          </span>
          <div className='description'>
            <DfMd source={desc} />
          </div>
          <ViewTags tags={tags} />
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
        <Link href='/blogs/[blogId]' as={`/blogs/${id}`}>
          <a className={'DfStatItem ' + (!postsCount && 'disable')}>
            <Pluralize count={postsCount} singularText='Post'/>
          </a>
        </Link>

        <div onClick={() => setFollowersOpen(true)} className={'DfStatItem DfGreyLink ' + (!followers && 'disable')}>
          <Pluralize count={followers} singularText='Follower'/>
        </div>

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
      dataSource={posts}
      renderItem={(item, index) =>
        <ViewPostPage key={index} variant='preview' postData={item.post} postExtData={item.ext}/>}
      noDataDesc='No posts yet'
      noDataExt={isMyBlog ? <Button href={`/blogs/${id}/posts/new`}>Create post</Button> : null}
    />;
  };
  const NewPostButton = () => isMyBlog ? <Button href={`/blogs/${id}/posts/new`} icon='plus' size='small' className='DfGreyButton'>New post</Button> : null;

  const postsSectionTitle = () => {
    return <div className='DfSection--withButton'>
      <span style={{ marginRight: '1rem' }}>{<Pluralize count={postsCount} singularText='Post'/>}</span>
      {posts.length ? <NewPostButton /> : null}
    </div>;
  };

  const RenderBlogCreator = () => (
    <MutedDiv className='DfCreator'>
      <div className='DfCreator--data'><Icon type='calendar' />Created on {formatUnixDate(time)}</div>
      <div className='DfCreator-owner'>
        <Icon type='user' />
        {'Owned by '}
        <AddressComponents
          className='DfGreyLink'
          value={account}
          isShort={true}
          isPadded={false}
          size={30}
          variant='username'
        />
      </div>
    </MutedDiv>
  );

  return <div className='ViewBlogWrapper'>
    <Section className='DfContentPage'>
      <HeadMeta title={name} desc={mdToText(desc)} image={image} />
      <div className='FullProfile'>
        {renderPreview()}
      </div>
      <div className='DfSpacedButtons'>
        <FollowBlogButton blogId={id} />
        <div onClick={() => setFollowersOpen(true)} className={'DfStatItem DfGreyLink ' + (!followers && 'disable')}>
          <Pluralize count={followers} singularText='Follower' />
        </div>
      </div>

      {followersOpen && <BlogFollowersModal id={id} accountsCount={blog.followers_count} open={followersOpen} close={() => setFollowersOpen(false)} title={<Pluralize count={followers} singularText='Follower' />} />}
      {renderPostPreviews()}
    </Section>
    <SpaceNav
      {...content}
      blogId={new BN(id)}
      creator={account}
    />
  </div>
};

ViewBlogPage.getInitialProps = async (props): Promise<any> => {
  const { res, query: { blogId } } = props
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial;
  const idOrHandle = blogId as string
  const id = await getBlogId(idOrHandle)
  if (!id && res) {
    res.statusCode = 404
    return { statusCode: 404 }
  }

  const blogData = id && await subsocial.findBlog(id)
  if (!blogData?.struct && res) {
    res.statusCode = 404
    return { statusCode: 404 }
  }

  const postIds = await substrate.postIdsByBlogId(new BN(blogId as string)) // TODO maybe delete this type cast?
  const posts = await subsocial.findPostsWithExt(postIds.reverse());
  return {
    blogData,
    posts
  };
};

export default ViewBlogPage;

const withLoadedData = (Component: React.ComponentType<Props>) => {
  return (props: Props) => {
    const { id } = props;

    if (!id) return <NoData description={<span>Blog id is not defined</span>} />;

    const { subsocial } = useSubsocialApi()
    const [ blogData, setBlogData ] = useState<BlogData>()

    useEffect(() => {
      const loadData = async () => {
        const blogData = await subsocial.findBlog(id)
        blogData && setBlogData(blogData)
      }
      loadData()
    }, [ false ])

    return blogData?.content ? <Component blogData={blogData} {...props}/> : <Loading />;
  };
};

export const ViewBlog = withLoadedData(ViewBlogPage)
