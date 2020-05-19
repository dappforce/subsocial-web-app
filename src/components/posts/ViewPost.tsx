import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { DfMd } from '../utils/DfMd';
import { Segment } from 'semantic-ui-react';
import { GenericAccountId as AccountId } from '@polkadot/types';
import Error from 'next/error'
import { nonEmptyStr, newLogger } from '@subsocial/utils';
import { HeadMeta } from '../utils/HeadMeta';
import { Loading, formatUnixDate, getBlogId, unwrapSubstrateId } from '../utils/utils';
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
import { Post, Blog } from '@subsocial/types/substrate/interfaces';
import { PostData, ExtendedPostData, ProfileData, BlogData } from '@subsocial/types/dto';
import { PostType, loadContentFromIpfs, PostExtContent } from './LoadPostUtils'
import { getSubsocialApi } from '../utils/SubsocialConnect';
import ViewTags from '../utils/ViewTags';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import AuthorPreview from '../profiles/address-views/AuthorPreview';
import SummarizeMd from '../utils/md/SummarizeMd';
import ViewPostLink from './ViewPostLink';
import { HasBlogIdOrHandle, HasPostId, postUrl } from '../utils/urls';
import SharePostAction from './SharePostAction';
import { CommentSection } from './CommentsSection';
import partition from 'lodash.partition'

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
  statusCode?: number,
  blog: Blog,
  replies?: ExtendedPostData[],
  parentPost?: PostData
};

export const ViewPostPage: NextPage<ViewPostPageProps> = (props: ViewPostPageProps) => {
  if (props.statusCode === 404) return <Error statusCode={props.statusCode} />

  const { postData } = props
  const { struct, content: initialContent } = postData;

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
    owner,
    replies,
    blog = { id: new BN(1) } as Blog, // TODO hack before fix resolved blog for comment
    parentPost
  } = props;

  const {
    id,
    created,
    ipfs_hash
  } = post;

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
          <Link href='/blogs/[blogId]/posts/[postId]/edit' as={postUrl(blog, post)}>
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
    // TODO replace on loaded blog after refactor this components
    const blogId = unwrapSubstrateId(blog_id) || unwrapSubstrateId(parentPost?.struct.blog_id)
    return <>
      <AuthorPreview
        address={account}
        owner={owner}
        withFollowButton
        isShort={true}
        isPadded={false}
        size={size}
        details={<div>
          {withBlogName && blogId && <><div className='DfGreyLink'><ViewBlog id={blogId} nameOnly withLink /></div>{' • '}</>}
          <Link href={postUrl(blog, post)}>
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
          <Voter struct={post} />
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
        {commentsSection && <CommentSection post={post} replies={replies} blog={blog} />}
      </Segment>
    </>;
  };

  const renderSharedPreview = () => {
    if (!originalPost || !originalContent) return <></>;

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
        {commentsSection && <CommentSection post={post} replies={replies} blog={blog} />}
        {postVotersOpen && <PostVoters id={id} active={activeVoters} open={postVotersOpen} close={() => setPostVotersOpen(false)}/>}
      </Segment>
    </>;
  };

  const renderDetails = (content?: PostExtContent) => {
    if (!content) return null;
    const { title, body, image, canonical, tags } = content;
    const goToCommentsId = 'comments'

    const renderResponseTitle = (parentPost: PostData) => <>
      In response to{' '}
      <ViewPostLink blog={blog} post={parentPost.struct} title={parentPost.content?.title} />
    </>
    const titleMsg = parentPost
      ? renderResponseTitle(parentPost)
      : title

    return <>
      <Section className='DfContentPage DfEntirePost'>
        <HeadMeta title={title} desc={body} image={image} canonical={canonical} tags={tags} />
        <div className='DfRow'>
          {<h1 className='DfPostName'>{titleMsg}</h1>}
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
          <Voter struct={post} />
          <SharePostAction postId={post.id} className='DfShareAction' />
        </div>
      </Section>
      <CommentSection post={post} hashId={goToCommentsId} replies={replies} blog={blog} />
    </>
  };

  switch (variant) {
    case 'name only': {
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
  const { substrate } = subsocial;
  const idOrHandle = blogId as string
  const blogIdFromUrl = await getBlogId(idOrHandle)

  const postIdFromUrl = new BN(postId as string)
  const replyIds = await substrate.getReplyIdsByPostId(postIdFromUrl)
  const comments = await subsocial.findPostsWithAllDetails([ ...replyIds, postIdFromUrl ])
  const [ extPostsData, replies ] = partition(comments, x => x.post.struct.id.eq(postIdFromUrl))
  const extPostData = extPostsData.pop()
  const isComment = extPostData?.post.struct.extension.isComment;
  const parentPostId = isComment && extPostData?.post.struct.extension.asComment.root_post_id
  const parentPost = parentPostId && await subsocial.findPost(parentPostId)
  const blogIdFromPost = unwrapSubstrateId(extPostData?.post.struct.blog_id)
  // If a blog id of this post is not equal to the blog id/handle from URL,
  // then redirect to the URL with the blog id of this post.
  if (blogIdFromPost && blogIdFromUrl && !blogIdFromPost.eq(blogIdFromUrl) && res) {
    res.writeHead(301, { Location: `/blogs/${blogIdFromPost.toString()}/posts/${postId}` })
    res.end()
  }

  return {
    postData: extPostData?.post,
    postExtData: extPostData?.ext,
    owner: extPostData?.owner,
    replies,
    blog: extPostData?.blog,
    parentPost
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
        const extPostData = id && await subsocial.findPostWithAllDetails(id)
        if (isSubscribe && extPostData) {
          const extension = extPostData.post.struct.extension
          if (extension.isComment) {
            const rootPostData = await subsocial.findPostWithAllDetails(extension.asComment.root_post_id)
            extPostData.blog = rootPostData?.blog || {} as BlogData
          }
          setExtData(extPostData)
        }
      };

      loadPost().catch(err => log.error('Failed to load post data:', err));

      return () => { isSubscribe = false; };
    }, [ false ]);

    if (isEmpty(extPostData)) return <Loading/>;

    return extPostData
      ? <Component
        {...props}
        blog={extPostData.blog.struct}
        postData={extPostData.post}
        postExtData={extPostData.ext}
        owner={extPostData.owner}
      />
      : null;
  };
};

export const ViewPost = withLoadedData(ViewPostPage);
