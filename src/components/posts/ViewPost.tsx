import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Segment } from 'semantic-ui-react';
import { GenericAccountId as AccountId } from '@polkadot/types';
import Error from 'next/error'
import { newLogger } from '@subsocial/utils';
import { HeadMeta } from '../utils/HeadMeta';
import { Loading, formatUnixDate, getBlogId } from '../utils/utils';
import { PostVoters } from '../voting/ListVoters';
import { ShareModal } from './ShareModal';
import NoData from '../utils/EmptyList';
import Section from '../utils/Section';
import { ViewBlog } from '../blogs/ViewBlog';
import isEmpty from 'lodash.isempty';
import { Icon, Menu, Dropdown } from 'antd';
import { useMyAccount } from '../utils/MyAccountContext';
import { NextPage } from 'next';
import BN from 'bn.js';
import { Post, PostId } from '@subsocial/types/substrate/interfaces';
import { PostData, ExtendedPostData } from '@subsocial/types/dto';
import { PostType, loadContentFromIpfs, getExtContent, PostExtContent } from './LoadPostUtils'
import { getSubsocialApi } from '../utils/SubsocialConnect';
import ViewTags from '../utils/ViewTags';
import { PreviewData, EmbedData, BlockValueKind } from '../types';
import { parse } from '../utils/index';
import { useSubsocialApi } from '../utils/SubsocialApiContext';

const log = newLogger('View post')

const BlockPreview = dynamic(() => import('./PostPreview/BlockPreview'), { ssr: false });
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
  blockValues?: BlockValueKind[];
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
    blockValues
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
  const [ embedData, setEmbedData ] = useState<EmbedData[]>([])
  const [ linkPreviewData, setLinkPreviewData ] = useState<PreviewData[]>([])

  const originalPost = postExtData && postExtData.struct;
  const [ originalContent, setOriginalContent ] = useState(getExtContent(postExtData?.content));

  console.log('blockValues from ViewPost main', blockValues)

  useEffect(() => {
    if (!ipfs_hash) return;
    let isSubscribe = true;

    loadContentFromIpfs(post).then(content => isSubscribe && setContent(content)).catch(err => log.error('Failed to load a post content from IPFS:', err));
    originalPost && loadContentFromIpfs(originalPost).then(content => isSubscribe && setOriginalContent(content)).catch(err => log.error('Failed to load content of a shared post from IPFS:', err));

    return () => { isSubscribe = false; };
  }, [ false ]);

  useEffect(() => {

    const firstLoad = async () => {
      if (!blockValues) return
      const res: PreviewData[] = []
      for (const x of blockValues) {
        if (x.kind === 'link' || x.kind === 'video') {
          const data = await parse(x.data)
          if (!data) continue
          res.push({ id: x.id, data })
        }
      }
      setLinkPreviewData(res)
    }

    firstLoad()

  }, [ content ])

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
    console.log('post, content from renderContent', post, content)
    if (!post || !content) return null;
    console.log('blockValues from renderContent', blockValues)
    const { title, summary } = content;
    const previewBlocks = blockValues?.filter((x: BlockValueKind) => x.useOnPreview === true)
    const hasPreviews = previewBlocks && previewBlocks.length !== 0
    const imageBlock = blockValues?.find((x: BlockValueKind) => x.kind === 'image')

    return <div className='MiniPreviewWrapper'>
      <div className='DfContent'>
        <div className='DfPostText'>
          {renderNameOnly(title || summary, post.id)}
          <div className='DfSummary'>
            {!hasPreviews && summary}
          </div>
    const { title, blockValues, summary } = content;
    const previewBlocks = blockValues.filter((x: BlockValueKind) => x.useOnPreview === true)
    const hasPreviews = previewBlocks && previewBlocks.length !== 0
    const imageBlock = blockValues?.find((x: BlockValueKind) => x.kind === 'image')

    return <div className='MiniPreviewWrapper'>
      <div className='DfContent'>
        <div className='DfPostText'>
          {renderNameOnly(title || summary, post.id)}
          <div className='DfSummary'>
            {!hasPreviews && summary}
          </div>
        </div>
        {hasPreviews
          ? previewBlocks?.map((x: BlockValueKind) => <div className='MiniPreviewBlock'><BlockPreview
            block={x}
            embedData={embedData}
            setEmbedData={setEmbedData}
            linkPreviewData={linkPreviewData}
          /></div>)
          : imageBlock && <div className='MiniPreviewBlock'><BlockPreview
            block={imageBlock}
            embedData={embedData}
            setEmbedData={setEmbedData}
            linkPreviewData={linkPreviewData}
          /></div>
          }
      </div>
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

  const renderDetails = (content: PostExtContent) => {
    const { title, canonical, tags, summary } = content;
    return <Section className='DfContentPage bookPage'>
      {<HeadMeta title={title} desc={summary} image={''} canonical={canonical} tags={tags} /> }
      <div className='header DfPostTitle' style={{ display: 'flex' }}>
        <div className='DfPostName'>{title}</div>
        <RenderDropDownMenu account={created.account}/>
      </div>
      {<StatsPanel id={post.id}/>}
      {renderBlogPreview(post)}
      {withCreatedBy && renderPostCreator(post)}
      <div style={{ margin: '1rem 0' }}>
        {blockValues && blockValues.length > 0 &&
          blockValues.map((x: BlockValueKind) => {
            return <div key={x.id} className={'viewPostBlock'}><BlockPreview
              block={x}
              embedData={embedData}
              setEmbedData={setEmbedData}
              linkPreviewData={linkPreviewData}
            /></div>
          })
        }
        <ViewTags tags={tags} />
      </div>
      <Voter struct={post} type={'Post'}/>
      {/* <ShareButtonPost postId={post.id}/> */}
      <CommentsByPost postId={post.id} post={post} />
    </Section>;
  };

  console.log('variant', variant)

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
  const postData = await subsocial.findPost(new BN(postId as string)) as any
  const { ipfs } = await getSubsocialApi()

  // Post was not found:
  if (!postData?.struct && res) {
    res.statusCode = 404
    return { statusCode: 404 }
  }

  const blogIdFromPost = postData?.struct.blog_id

  // If blog id of this post is not equal to blog id/handle from URL,
  // then redirect to the URL with blog id of this post.
  if (blogIdFromPost && !blogIdFromPost.eq(blogIdFromUrl) && res) {
    res.writeHead(301, { Location: `/blogs/${blogIdFromPost.toString()}/posts/${postId}` })
    res.end()
  }

  const blockValues = []
  if (postData?.content.blocks && postData?.content.blocks.length > 0) {
    for (const item of postData?.content.blocks) {
      const value = await ipfs.findPost(item.cid)
      blockValues.push(value)
    }
  }

  return {
    postData,
    postExtData: {} as any,
    blockValues
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

    console.log('extPostData from withLoadedData', extPostData)

    return extPostData ? <Component postData={extPostData.post} postExtData={extPostData.ext} {...props}/> : null;
  };
};

export const ViewPost = withLoadedData(ViewPostPage);
