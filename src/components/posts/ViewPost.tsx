import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import { DfMd } from '../utils/DfMd';
import { Segment } from 'semantic-ui-react';
import { GenericAccountId as AccountId } from '@polkadot/types';
import Error from 'next/error'
import { nonEmptyStr, newLogger } from '@subsocial/utils';
import { HeadMeta } from '../utils/HeadMeta';
import { Loading, formatUnixDate, getBlogId } from '../utils/utils';
// import { PostHistoryModal } from '../utils/ListsEditHistory';
import { PostVoters } from '../voting/ListVoters';
import { ShareModal } from './ShareModal';
import NoData from '../utils/EmptyList';
import Section from '../utils/Section';
import { ViewBlog } from '../blogs/ViewBlog';
import { DfBgImg } from '../utils/DfBgImg';
import isEmpty from 'lodash.isempty';
import { isMobile } from 'react-device-detect';
import { Icon, Menu, Dropdown } from 'antd';
import { useMyAccount } from '../utils/MyAccountContext';
import { NextPage } from 'next';
import BN from 'bn.js';
import { Post, PostId } from '@subsocial/types/substrate/interfaces';
import { PostData, ExtendedPostData } from '@subsocial/types/dto';
import { PostType, loadContentFromIpfs, getExtContent, PostExtContent } from './LoadPostUtils'
import { getSubsocialApi } from '../utils/SubsocialConnect';
import ViewTags from '../utils/ViewTags';
import { useSubsocialApi } from '../utils/SubsocialApiContext';

const log = newLogger('View post')

const CommentsByPost = dynamic(() => import('./ViewComment'), { ssr: false });
const Voter = dynamic(() => import('../voting/Voter'), { ssr: false });
const AddressComponents = dynamic(() => import('../utils/AddressComponents'), { ssr: false });
const StatsPanel = dynamic(() => import('./PostStats'), { ssr: false });

type PostVariant = 'full' | 'preview' | 'name only';

type ViewPostProps = {
  variant: PostVariant;
  withLink?: boolean;
  withCreatedBy?: boolean;
  withStats?: boolean;
  withActions?: boolean;
  withBlogName?: boolean;
  id?: BN;
  commentIds?: BN[];
};

type ViewPostPageProps = {
  variant: PostVariant;
  withLink?: boolean;
  withCreatedBy?: boolean;
  withStats?: boolean;
  withActions?: boolean;
  withBlogName?: boolean;
  postData: PostData;
  postExtData?: PostData;
  commentIds?: BN[];
  statusCode?: number
};

export const ViewPostPage: NextPage<ViewPostPageProps> = (props: ViewPostPageProps) => {
  if (props.statusCode === 404) return <Error statusCode={props.statusCode} />

  const { struct, content: initialContent } = props.postData;

  if (!struct) return <NoData description={<span>Post not found</span>} />;

  const post = struct;

  const {
    variant = 'full',
    withBlogName = false,
    withLink = true,
    withActions = true,
    withStats = true,
    withCreatedBy = true,
    postExtData
  } = props;

  const {
    id,
    blog_id,
    created,
    ipfs_hash,
    edit_history
  } = post;

  const type: PostType = isEmpty(postExtData) ? 'regular' : 'share';
  // console.log('Type of the post:', type);
  const isRegularPost = type === 'regular';
  const [ content, setContent ] = useState(getExtContent(initialContent));
  const [ commentsSection, setCommentsSection ] = useState(false);
  const [ postVotersOpen, setPostVotersOpen ] = useState(false);
  const [ activeVoters ] = useState(0);

  const originalPost = postExtData && postExtData.struct;
  const [ originalContent, setOriginalContent ] = useState(getExtContent(postExtData?.content));

  useEffect(() => {
    if (!ipfs_hash) return;
    let isSubscribe = true;

    loadContentFromIpfs(post).then(content => isSubscribe && setContent(content)).catch(err => log.error('Failed to load a post content from IPFS:', err));
    originalPost && loadContentFromIpfs(originalPost).then(content => isSubscribe && setOriginalContent(content)).catch(err => log.error('Failed to load content of a shared post from IPFS:', err));

    return () => { isSubscribe = false; };
  }, [ false ]);

  type DropdownProps = {
    account: string | AccountId;
  };

  const RenderDropDownMenu = (props: DropdownProps) => {
    const { state: { address } } = useMyAccount();
    const isMyStruct = address === props.account;
    const showDropdown = isMyStruct || edit_history.length > 0;

    const menu = (
      <Menu>
        {isMyStruct && <Menu.Item key='0'>
          <Link href='/blogs/[blogId]/posts/[postId]/edit' as={`/blogs/${blog_id}/posts/${id}/edit`}><a className='item'>Edit</a></Link>
        </Menu.Item>}
        {/* {edit_history.length > 0 && <Menu.Item key='1'>
          <div onClick={() => setOpen(true)} >View edit history</div>
        </Menu.Item>} */}
      </Menu>
    );

    return (<>
      {showDropdown &&
      <Dropdown overlay={menu} placement='bottomRight'>
        <Icon type='ellipsis' />
      </Dropdown>}
      {/* open && <PostHistoryModal id={id} open={open} close={close} /> */}
    </>);
  };

  const renderNameOnly = (title: string | undefined, id: PostId) => {
    if (!title || !id) return null;
    return withLink
      ? <Link href='/blogs/[blogId]/posts/[postId]' as={`/blogs/${blog_id}/posts/${id}`} >
        <a className='header DfPostTitle--preview'>
          {title}
        </a>
      </Link>
      : <div className='header DfPostTitle--preview'>{title}</div>;
  };

  const renderPostCreator = (post: Post, size?: number) => {
    if (isEmpty(post)) return null;
    const { blog_id, created: { account, time } } = post;
    return <>
      <AddressComponents
        withFollowButton={true}
        value={account}
        isShort={true}
        isPadded={false}
        size={size}
        extraDetails={<div>
          {withBlogName && <><div className='DfGreyLink'><ViewBlog id={blog_id} nameOnly /></div>{' • '}</>}
          <Link href='/blogs/[blogId]/posts/[postId]' as={`/blogs/${blog_id}/posts/${id}`} >
            <a className='DfGreyLink'>
              {formatUnixDate(time)}
            </a>
          </Link>
        </div>}
      />
    </>;
  };

  const renderBlogPreview = (post: Post) => {
    if (isEmpty(post)) return null

    const { blog_id } = post

    return <ViewBlog id={blog_id} miniPreview withFollowButton />
  }

  const renderContent = (post: Post, content: PostExtContent | undefined) => {
    if (!post || !content) return null;

    const { title, summary, image } = content;
    const hasImage = nonEmptyStr(image);

    return <div className='DfContent'>
      <div className='DfPostText'>
        {renderNameOnly(title || summary, post.id)}
        <div className='DfSummary'>
          {summary}
        </div>
      </div>
      {hasImage && <DfBgImg src={image} size={isMobile ? 100 : 160} className='DfPostImagePreview' /* add onError handler */ />}
    </div>;
  };

  const RenderActionsPanel = () => {
    const [ open, setOpen ] = useState(false);
    const close = () => setOpen(false);
    return (
      <div className='DfActionsPanel'>
        <div className='DfAction'><Voter struct={post} type={'Post'} /></div>
        <div
          className='ui tiny button basic DfAction'
          onClick={() => setCommentsSection(!commentsSection)}
        >
          <Icon type='message' />
        Comment
        </div>
        <div
          className='ui tiny button basic DfAction'
          onClick={() => setOpen(true)}
        >
          <Icon type='share-alt' />
        Share
        </div>
        {open && <ShareModal postId={isRegularPost ? id : originalPost && originalPost.id} open={open} close={close} />}
      </div>);
  };

  const renderRegularPreview = () => {
    return <>
      <Segment className={`DfPostPreview`}>
        <div className='DfInfo'>
          <div className='DfRow'>
            {renderPostCreator(post)}
            <RenderDropDownMenu account={created.account}/>
          </div>
          {renderContent(post, content)}
        </div>
        <ViewTags tags={content?.tags} />
        {withStats && <StatsPanel id={post.id}/>}
        {withActions && <RenderActionsPanel/>}
        {commentsSection && <CommentsByPost postId={post.id} post={post} />}
      </Segment>
    </>;
  };

  const renderSharedPreview = () => {
    if (!originalPost || !originalContent) return <></>;
    const account = originalPost.created.account;
    return <>
      <Segment className={`DfPostPreview`}>
        <div className='DfRow'>
          {renderPostCreator(post)}
          <RenderDropDownMenu account={created.account}/>
        </div>
        <div className='DfSharedSummary'>{renderNameOnly(content?.summary, id)}</div>
        <Segment className='DfPostPreview'>
          <div className='DfInfo'>
            <div className='DfRow'>
              {renderPostCreator(originalPost)}
              <RenderDropDownMenu account={account}/>
            </div>
            {renderContent(originalPost, originalContent)}
          </div>
          {withStats && <StatsPanel id={originalPost.id}/> /* TODO params originPost */}
        </Segment>
        {withActions && <RenderActionsPanel/>}
        {commentsSection && <CommentsByPost postId={post.id} post={post} />}
        {postVotersOpen && <PostVoters id={id} active={activeVoters} open={postVotersOpen} close={() => setPostVotersOpen(false)}/>}
      </Segment>
    </>;
  };

  const renderDetails = (content?: PostExtContent) => {
    if (!content) return null;
    const { title, body, image, canonical, tags } = content;
    return <Section className='DfContentPage'>
      <HeadMeta title={title} desc={body} image={image} canonical={canonical} tags={tags} />
      <div className='header DfPostTitle' style={{ display: 'flex' }}>
        <div className='DfPostName'>{title}</div>
        <RenderDropDownMenu account={created.account}/>
      </div>
      {<StatsPanel id={post.id}/>}
      {withCreatedBy && renderPostCreator(post)}
      <div style={{ margin: '1rem 0' }}>
        {image && <img src={image} className='DfPostImage' /* add onError handler */ />}
        <DfMd source={body} />
        {/* TODO render tags */}
        {withCreatedBy && renderPostCreator(post)}
        {renderBlogPreview(post)}
      </div>
      <ViewTags tags={tags} />
      <Voter struct={post} type={'Post'}/>
      {/* <ShareButtonPost postId={post.id}/> */}
      <CommentsByPost postId={post.id} post={post} />
    </Section>;
  };

  switch (variant) {
    case 'name only': {
      return renderNameOnly(content?.title, id);
    }
    case 'preview': {
      switch (type) {
        case 'regular': {
          return renderRegularPreview();
        }
        case 'share': {
          return renderSharedPreview();
        }
      }
      break;
    }
    case 'full': {
      return renderDetails(content);
    }
    default: {
      return <div>You should not be here!</div>;
    }
  }
};

ViewPostPage.getInitialProps = async (props): Promise<any> => {
  const { query: { blogId, postId }, res } = props;
  const subsocial = await getSubsocialApi()
  const idOrHandle = blogId as string
  const blogIdFromUrl = await getBlogId(idOrHandle)
  const extPostData = await subsocial.findPostWithExt(new BN(postId as string))

  // Post was not found:
  if (!extPostData?.post.struct && res) {
    res.statusCode = 404
    return { statusCode: 404 }
  }

  const blogIdFromPost = extPostData?.post.struct?.blog_id

  // If blog id of this post is not equal to blog id/handle from URL,
  // then redirect to the URL with blog id of this post.
  if (blogIdFromPost && !blogIdFromPost.eq(blogIdFromUrl) && res) {
    res.writeHead(301, { Location: `/blogs/${blogIdFromPost.toString()}/posts/${postId}` })
    res.end()
  }

  return {
    postData: extPostData?.post,
    postExtData: extPostData?.ext
  };
};

export default ViewPostPage;

const withLoadedData = (Component: React.ComponentType<ViewPostPageProps>) => {
  return (props: ViewPostProps) => {
    const { id } = props;
    const [ extPostData, setExtData ] = useState<ExtendedPostData>();
    const { subsocial } = useSubsocialApi()

    useEffect(() => {
      let isSubscribe = true;
      const loadPost = async () => {
        const extPostData = id && await subsocial.findPostWithExt(id)
        isSubscribe && extPostData && setExtData(extPostData);
      };

      loadPost().catch(err => log.error('Failed to load post data:', err));

      return () => { isSubscribe = false; };
    }, [ false ]);

    if (isEmpty(extPostData)) return <Loading/>;

    return extPostData ? <Component postData={extPostData.post} postExtData={extPostData.ext} {...props}/> : null;
  };
};

export const ViewPost = withLoadedData(ViewPostPage);
