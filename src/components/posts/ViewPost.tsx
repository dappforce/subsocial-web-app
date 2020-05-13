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
import { PostVoters } from '../voting/ListVoters';
import NoData from '../utils/EmptyList';
import Section from '../utils/Section';
import { ViewBlog } from '../blogs/ViewBlog';
import { DfBgImg } from '../utils/DfBgImg';
import isEmpty from 'lodash.isempty';
import { isMobile, isBrowser } from 'react-device-detect';
import { Icon, Menu, Dropdown } from 'antd';
import { isMyAddress } from '../utils/MyAccountContext';
import { NextPage } from 'next';
import BN from 'bn.js';
import { Post } from '@subsocial/types/substrate/interfaces';
import { PostData, ExtendedPostData, ProfileData } from '@subsocial/types/dto';
import { PostType, loadContentFromIpfs, PostExtContent } from './LoadPostUtils'
import { getSubsocialApi } from '../utils/SubsocialConnect';
import ViewTags from '../utils/ViewTags';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import AuthorPreview from '../profiles/address-views/AuthorPreview';
import SummarizeMd from '../utils/md/SummarizeMd';
import ViewPostLink from './ViewPostLink';
import { HasBlogIdOrHandle, HasPostId, newBlogUrlFixture } from '../utils/urls';
import SharePostAction from './SharePostAction';

const log = newLogger('View Post')

const Voter = dynamic(() => import('../voting/Voter'), { ssr: false });
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
  owner?: ProfileData,
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
    postExtData,
    owner
  } = props;

  const {
    id,
    blog_id,
    created,
    ipfs_hash,
    extension
  } = post;

  console.log(extension);
  const type: PostType = isEmpty(postExtData) ? 'regular' : 'share';
  const isRegularPost = type === 'regular';
  const [ content, setContent ] = useState(initialContent || {} as PostExtContent);
  const [ commentsSection, setCommentsSection ] = useState(false);
  const [ postVotersOpen, setPostVotersOpen ] = useState(false);
  const [ activeVoters ] = useState(0);

  const originalPost = postExtData && postExtData.struct;
  const [ originalContent, setOriginalContent ] = useState(postExtData?.content)

  useEffect(() => {
    if (!ipfs_hash) return;
    let isSubscribe = true;

    loadContentFromIpfs(post)
      .then(content => isSubscribe && setContent(content))
      .catch(err => log.error('Failed to load a post content from IPFS:', err));

    originalPost && loadContentFromIpfs(originalPost)
      .then(content => isSubscribe && setOriginalContent(content))
      .catch(err => log.error('Failed to load content of a shared post from IPFS:', err));

    return () => { isSubscribe = false; };
  }, [ false ]);

  type DropdownProps = {
    account: string | AccountId;
  };

  const RenderDropDownMenu = (props: DropdownProps) => {
    const isMyPost = isMyAddress(props.account);

    const menu = (
      <Menu>
        {isMyPost && <Menu.Item key='0'>
          <Link href='/blogs/[blogId]/posts/[postId]/edit' as={`/blogs/${blog_id}/posts/${id}/edit`}>
            <a className='item'>Edit</a>
          </Link>
        </Menu.Item>}
        {/* {edit_history.length > 0 && <Menu.Item key='1'>
          <div onClick={() => setOpen(true)} >View edit history</div>
        </Menu.Item>} */}
      </Menu>
    );

    return <>
      {isMyPost &&
        <Dropdown overlay={menu} placement='bottomRight'>
          <Icon type='ellipsis' />
        </Dropdown>
      }
      {/* open && <PostHistoryModal id={id} open={open} close={close} /> */}
    </>
  };

  const renderPostLink = (blog: HasBlogIdOrHandle, post: HasPostId, title?: string) =>
    <ViewPostLink blog={blog} post={post} title={title} className='DfBlackLink' />

  const renderNameOnly = (blog: HasBlogIdOrHandle, post: HasPostId, title?: string) => {
    if (!blog?.id || !post?.id || !title) return null

    return (
      <div className={'header DfPostTitle--preview'}>
        {withLink ? renderPostLink(blog, post, title) : title}
      </div>
    )
  }

  const renderPostCreator = (post: Post, owner?: ProfileData, size?: number) => {
    if (isEmpty(post)) return null;
    const { blog_id, created: { account, time } } = post;
    const blogId = blog_id as unknown as BlogId;
    return <>
      <AuthorPreview
        address={account}
        owner={owner}
        withFollowButton
        isShort={true}
        isPadded={false}
        size={size}
        details={<div>
          {withBlogName && blogId && <><div className='DfGreyLink'><ViewBlog id={blogId} nameOnly /></div>{' • '}</>}
          <Link href='/blogs/[blogId]/posts/[postId]' as={`/blogs/${blog_id}/posts/${id}`} >
            <a className='DfGreyLink'>
              {formatUnixDate(time)}
            </a>
          </Link>
        </div>}
      />
    </>;
  };

  const renderPostImage = (content?: PostExtContent) => {
    if (!content) return null;

    const { image } = content;

    return nonEmptyStr(image) &&
      <DfBgImg src={image} size={isMobile ? 100 : 160} className='DfPostImagePreview' /* add onError handler */ />
  }

  const renderContent = (post: Post, content?: PostExtContent) => {
    if (!post || !content) return null;

    const { title, body } = content;

    // TODO Fix this hack
    const blog = newBlogUrlFixture(post.blog_id)

    return <div className='DfContent'>
      {renderNameOnly(blog, post, title)}
      <SummarizeMd md={body} more={renderPostLink(blog, post, 'See More')} />
    </div>
  }

  const RenderActionsPanel = () => {
    const postId = isRegularPost ? id : originalPost && originalPost.id
    const actionClass = 'ui tiny button basic DfAction'

    return (
      <div className='DfActionsPanel'>
        <div className='DfAction'>
          <Voter struct={post} type={'Post'} />
        </div>
        <div className={actionClass} onClick={() => setCommentsSection(!commentsSection)}>
          <Icon type='message' />
          Comment
        </div>
        <SharePostAction postId={postId} className={actionClass} />
      </div>
    );
  };

  const renderInfoPostPreview = (post: Post, content: PostExtContent, owner?: ProfileData) => {
    if (!content || !post) return null;
    return <div className='DfInfo'>
      <div className='DfRow'>
        <div>
          <div className='DfRow'>
            {renderPostCreator(post, owner)}
            <RenderDropDownMenu account={post.created.account}/>
          </div>
          {renderContent(post, content)}
          <ViewTags tags={content?.tags} />
          {/* {withStats && <StatsPanel id={post.id}/>} */}
        </div>
        <div>
          {renderPostImage(content)}
        </div>
      </div>
    </div>
  }

  const renderRegularPreview = () => {
    return <>
      <Segment className='DfPostPreview'>
        {renderInfoPostPreview(post, content, owner)}
        {withActions && <RenderActionsPanel/>}
        {commentsSection && <CommentSection post={post} />}
      </Segment>
    </>;
  };

  const renderSharedPreview = () => {
    if (!originalPost || !originalContent) return <></>;

    // TODO Fix this hack
    const blog = newBlogUrlFixture(originalPost.blog_id)

    return <>
      <Segment className={`DfPostPreview`}>
        <div className='DfRow'>
          {renderPostCreator(post, owner)}
          <RenderDropDownMenu account={created.account}/>
        </div>
        <div className='DfSharedSummary'>
          <SummarizeMd md={content?.body} more={renderPostLink(blog, originalPost, 'See More')} />
        </div>
        <Segment className='DfPostPreview'>
          {renderInfoPostPreview(originalPost, originalContent)}
          {withStats && <StatsPanel id={originalPost.id}/> /* TODO params originPost */}
        </Segment>
        {withActions && <RenderActionsPanel/>}
        {commentsSection && <CommentSection post={post} />}
        {postVotersOpen && <PostVoters id={id} active={activeVoters} open={postVotersOpen} close={() => setPostVotersOpen(false)}/>}
      </Segment>
    </>;
  };

  const renderDetails = (content?: PostExtContent) => {
    if (!content) return null;
    const { title, body, image, canonical, tags } = content;
    const goToCommentsId = 'comments'

    return <>
      <Section className='DfContentPage DfEntirePost'>
        <HeadMeta title={title} desc={body} image={image} canonical={canonical} tags={tags} />
        <div className='DfRow'>
          <h1 className='DfPostName'>{title}</h1>
          <RenderDropDownMenu account={created.account}/>
        </div>
        <div className='DfRow'>
          {withCreatedBy && renderPostCreator(post, owner)}
          {isBrowser && <StatsPanel id={post.id} goToCommentsId={goToCommentsId} />}
        </div>
        <div className='DfPostContent'>
          {image && <img src={image} className='DfPostImage' /* add onError handler */ />}
          <DfMd source={body} />
          {/* {renderBlogPreview(post)} */}
        </div>
        <ViewTags tags={tags} />
        <div className='DfRow'>
          <Voter struct={post} type={'Post'} />
          <SharePostAction postId={post.id} className='DfShareAction' />
        </div>
     </Section>
     <CommentSection post={post} hashId={goToCommentsId} />
    </>
  };

  switch (variant) {
    case 'name only': {
      // TODO Fix this hack
      const blog = newBlogUrlFixture(blog_id)
      return renderNameOnly(blog, post, content?.title);
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
  if (!extPostData?.post?.struct && res) {
    res.statusCode = 404
    return { statusCode: 404 }
  }

  const blogIdFromPost = extPostData?.post.struct?.blog_id
  const ownerId = extPostData?.post.struct?.created.account as AccountId;
  const owner = await subsocial.findProfile(ownerId);

  // If a blog id of this post is not equal to the blog id/handle from URL,
  // then redirect to the URL with the blog id of this post.
  if (blogIdFromPost && !blogIdFromPost.eq(blogIdFromUrl) && res) {
    res.writeHead(301, { Location: `/blogs/${blogIdFromPost.toString()}/posts/${postId}` })
    res.end()
  }

  return {
    postData: extPostData?.post,
    postExtData: extPostData?.ext,
    owner
  };
};

export default ViewPostPage;

const withLoadedData = (Component: React.ComponentType<ViewPostPageProps>) => {
  return (props: ViewPostProps) => {
    const { id } = props;
    const [ extPostData, setExtData ] = useState<ExtendedPostData>();
    const [ owner, setOwner ] = useState<ProfileData>()
    const { subsocial } = useSubsocialApi()

    useEffect(() => {
      let isSubscribe = true;
      const loadPost = async () => {
        const extPostData = id && await subsocial.findPostWithExt(id)
        if (isSubscribe && extPostData) {
          setExtData(extPostData);
          const ownerId = extPostData.post.struct.created.account
          const owner = await subsocial.findProfile(ownerId)
          setOwner(owner);
        }
      };

      loadPost().catch(err => log.error('Failed to load post data:', err));

      return () => { isSubscribe = false; };
    }, [ false ]);

    if (isEmpty(extPostData)) return <Loading/>;

    return extPostData ? <Component postData={extPostData.post} postExtData={extPostData.ext} owner={owner} {...props}/> : null;
  };
};

export const ViewPost = withLoadedData(ViewPostPage);
