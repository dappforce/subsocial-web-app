import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Segment } from 'semantic-ui-react';

import { withCalls, withMulti, withApi } from '@polkadot/ui-api/with';
import { Option, AccountId } from '@polkadot/types';

import { getJsonFromIpfs } from '../utils/OffchainUtils';
import { PostId, Post, CommentId, PostContent } from '../types';
import { queryBlogsToProp, SeoHeads } from '../utils/index';
import { Loading } from '../utils/utils';
import { CommentsByPost } from './ViewComment';
import { MutedSpan } from '../utils/MutedText';
const Voter = dynamic(() => import('../voting/Voter'), { ssr: false });
import { PostHistoryModal } from '../utils/ListsEditHistory';
import { PostVoters, ActiveVoters } from '../voting/ListVoters';
import AddressMiniDf from '../utils/AddressMiniDf';
import { api as webApi } from '@polkadot/ui-api';
import { ShareModal } from './ShareModal';
import { NoData } from '../utils/DataList';
import Section from '../utils/Section';
import { Pluralize } from '../utils/Plularize';
import { ViewBlog } from '../blogs/ViewBlog';
import { DfBgImg } from '../utils/DfBgImg';
import { isEmpty } from 'lodash';
import { isMobile } from 'react-device-detect';
import { Icon, Menu, Dropdown } from 'antd';
import { useMyAccount } from '../utils/MyAccountContext';
import Api from '../utils/SubstrateApi';
import { NextPage } from 'next';
import { ApiProps } from '@polkadot/ui-api/types';
import { ApiPromise } from '@polkadot/api';

const LIMIT_SUMMARY = isMobile ? 75 : 150;

type PostVariant = 'full' | 'preview' | 'name only';

type PostType = 'regular' | 'share';

type PostExtContent = PostContent & {
  summary: string;
};

export type PostData = {
  post?: Post,
  initialContent?: PostExtContent
};

export type PostDataListItem = {
  postData: PostData,
  postExtData: PostData
};

type ViewPostProps = {
  variant: PostVariant,
  type?: PostType,
  withLink?: boolean,
  withCreatedBy?: boolean,
  withStats?: boolean,
  withActions?: boolean,
  withBlogName?: boolean,
  id?: PostId,
  postData: PostData,
  postById?: Option<Post>,
  postExtData: PostData,
  commentIds?: CommentId[]
};

export const ViewPostPage: NextPage<ViewPostProps> = (props: ViewPostProps) => {
  const { post, initialContent = {} as PostExtContent } = props.postData;

  if (!post) return <NoData description={<span>Post not found</span>} />;

  const {
    variant = 'full',
    type = 'regular',
    withBlogName = false,
    withLink = true,
    withActions = true,
    withStats = true,
    withCreatedBy = true,
    postExtData
  } = props;

  const {
    id,
    created,
    ipfs_hash,
    extension,
    isRegularPost,
    edit_history
  } = post;

  console.log(post);

  const { state: { address } } = useMyAccount();
  const [ content , setContent ] = useState(initialContent);
  const [ commentsSection, setCommentsSection ] = useState(false);
  const [ postVotersOpen, setPostVotersOpen ] = useState(false);
  const [ activeVoters, setActiveVoters ] = useState(0);

  const { post: originalPost, initialContent: originalContent } = postExtData;

  const openVoters = (type: ActiveVoters) => {
    setPostVotersOpen(true);
    setActiveVoters(type);
  };

  useEffect(() => {
    if (!ipfs_hash) return;
    let isSubscribe = true;

    loadContentFromIpfs(post).then(content => isSubscribe && setContent(content)).catch(console.log);

    return () => { isSubscribe = false; };
  }, [ false ]);

  type DropdownProps = {
    account: string | AccountId
  };

  const RenderDropDownMenu = (props: DropdownProps) => {

    const isMyStruct = address === props.account;

    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    const showDropdown = isMyStruct || edit_history.length > 0;

    const menu = (
      <Menu>
        {isMyStruct && <Menu.Item key='0'>
        <Link href='/post/edit/[id]' as={`/post/edit/${id}`}><a className='item'>Edit</a></Link>
        </Menu.Item>}
        {edit_history.length > 0 && <Menu.Item key='1'>
          <div onClick={() => setOpen(true)} >View edit history</div>
        </Menu.Item>}
      </Menu>
    );

    return (<>
    {showDropdown &&
      <Dropdown overlay={menu} placement='bottomRight'>
      <Icon type='ellipsis' />
    </Dropdown>}
    {open && <PostHistoryModal id={id} open={open} close={close} />}
    </>);
  };

  const renderNameOnly = (title: string, id: PostId) => {
    if (!title || !id) return null;
    return withLink
      ? <Link href='/post/[id]' as={`/post/${id}`} >
        <a className='header DfPostTitle--preview'>
          {title}
        </a>
      </Link>
      : <div className='header DfPostTitle--preview'>{title}</div>;
  };

  const renderPostCreator = (post: Post, size?: number) => {
    if (isEmpty(post)) return null;
    const { blog_id , created: { account, time } } = post;
    return <>
      <AddressMiniDf
        value={account}
        isShort={true}
        isPadded={false}
        size={size}
        extraDetails={<div>
          {withBlogName && <><div className='DfGreyLink'><ViewBlog id={blog_id} nameOnly /></div>{' • '}</>}
          <Link href='/post/[id]' as={`/post/${id}`} >
            <a className='DfGreyLink'>
              {time}
            </a>
          </Link>
        </div>}
      />
    </>;
  };

  const renderContent = (post: Post, content: PostExtContent) => {
    if (!post || !content) return null;

    const { title, summary, image } = content;
    return <div className='DfContent'>
      <div className='DfPostText'>
        {renderNameOnly(title ? title : summary, post.id)}
        <div className='DfSummary'>
          <ReactMarkdown className='DfMd' source={summary} linkTarget='_blank' />
        </div>
      </div>
      {content.image && <DfBgImg src={image} size={isMobile ? 100 : 160} className='DfPostImagePreview' /* add onError handler */ />}
    </div>;
  };

  const RenderActionsPanel = () => {
    const [open, setOpen] = useState(false);
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

  const renderStatsPanel = (post: Post) => {
    if (post.id === undefined) return null;

    const { reactions_count, comments_count, shares_count, score } = post;

    return (<>
    <div className='DfCountsPreview'>
      {!extension.value && <MutedSpan><div onClick={() => reactions_count && openVoters(ActiveVoters.All)} className={reactions_count ? '' : 'disable'}><Pluralize count={reactions_count} singularText='Reaction'/></div></MutedSpan>}
      <MutedSpan><div onClick={() => setCommentsSection(!commentsSection)}>
      <Pluralize count={comments_count} singularText='Comment'/></div></MutedSpan>
      <MutedSpan><div><Pluralize count={shares_count} singularText='Share'/></div></MutedSpan>
      <MutedSpan><Pluralize count={score} singularText='Point' /></MutedSpan>
    </div>
    {postVotersOpen && <PostVoters id={id} active={activeVoters} open={postVotersOpen} close={() => setPostVotersOpen(false)}/>}
    </>);
  };

  const renderRegularPreview = () => {
    return <>
      <Segment className={`DfPostPreview ${withActions && 'p-b-0'}`}>
      <div className='DfInfo'>
        <div className='DfRow'>
          {renderPostCreator(post)}
          <RenderDropDownMenu account={created.account}/>
        </div>
        {renderContent(post, content)}
      </div>
      {withStats && renderStatsPanel(post)}
      {withActions && <RenderActionsPanel/>}
      {commentsSection && <CommentsByPost postId={post.id} post={post} />}
      </Segment>
    </>;
  };

  const renderSharedPreview = () => {
    if (!originalPost || !originalContent) return <></>;
    const account = originalPost.created.account;
    return <>
      <Segment className={`DfPostPreview ${withActions && 'p-b-0'}`}>
          <div className='DfRow'>
            {renderPostCreator(post)}
            <RenderDropDownMenu account={created.account}/>
          </div>
        <div className='DfSharedSummary'>{renderNameOnly(content.summary, id)}</div>
        {/* TODO add body*/}
        <Segment className='DfPostPreview'>
          <div className='DfInfo'>
            <div className='DfRow'>
              {renderPostCreator(originalPost)}
              <RenderDropDownMenu account={account}/>
            </div>
            {renderContent(originalPost, originalContent)}
          </div>
          {withStats && renderStatsPanel(originalPost) /* todo params originPost */}
        </Segment>
        {withStats && renderStatsPanel(post) /* todo voters %%%*/ }
        {withActions && <RenderActionsPanel/>}
        {commentsSection && <CommentsByPost postId={post.id} post={post} />}
        {postVotersOpen && <PostVoters id={id} active={activeVoters} open={postVotersOpen} close={() => setPostVotersOpen(false)}/>}
      </Segment>
    </>;
  };

  const renderDetails = (content: PostExtContent) => {
    const { title, body, image } = content;
    return <Section className='DfContentPage'>
      <SeoHeads title={title} name={title} desc={body} image={image} />
      <div className='header DfPostTitle' style={{ display: 'flex' }}>
        <div className='DfPostName'>{title}</div>
        <RenderDropDownMenu account={created.account}/>
      </div>
      {renderStatsPanel(post)}
      {withCreatedBy && renderPostCreator(post)}
      <div style={{ margin: '1rem 0' }}>
        {image && <img src={image} className='DfPostImage' /* add onError handler */ />}
        <ReactMarkdown className='DfMd details' source={body} linkTarget='_blank' />
        {/* TODO render tags */}
      </div>
      <Voter struct={post} type={'Post'}/>
      {/* <ShareButtonPost postId={post.id}/> */}
      <CommentsByPost postId={post.id} post={post} />
    </Section>;
  };

  switch (variant) {
    case 'name only': {
      return renderNameOnly(content.title, id);
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
      return <div>You should not be here!!!</div>;
    }
  }
  return <div>You should not be here!!!</div>;
};

ViewPostPage.getInitialProps = async (props): Promise<any> => {
  const { query: { id }, req } = props;
  console.log('Initial', props.query);
  const api = req ? await Api.setup() : webApi;
  const postData = await loadPostData(api, new PostId(id as string)) as PostData;
  const postExtData = await loadExtPost(api, postData.post as Post);
  Api.destroy();
  return {
    postData,
    postExtData
  };
};

export default ViewPostPage;

const withUnwrap = (Component: React.ComponentType<ViewPostProps>) => {
  return (props: ApiProps & ViewPostProps) => {
    const { postById, api } = props;
    const [ postExtData, setExtData ] = useState();
    if (!postById) return <Loading/>;

    const post = postById.unwrap();
    loadExtPost(api, post).then(data => setExtData(data)).catch(console.log);

    return <Component postData={{ post }} postExtData={postExtData} type={getTypePost(post)} {...props}/>;
  };
};

export const ViewPost = withMulti(
  ViewPostPage,
  withCalls<ViewPostProps>(
    queryBlogsToProp('postById', 'id')
  ),
  withApi,
  withUnwrap
);

const getTypePost = (post: Post): PostType => {
  const { isSharedPost } = post;
  if (isSharedPost) {
    return 'share';
  } else {
    return 'regular';
  }
};

const makeSummary = (body: string) => (
  body.length > LIMIT_SUMMARY
  ? body.substr(0, LIMIT_SUMMARY) + '...'
  : body
);

const loadContentFromIpfs = async (post: Post): Promise<PostExtContent> => {
  const ipfsContent = await getJsonFromIpfs<PostContent>(post.ipfs_hash);
  const summary = makeSummary(ipfsContent.body);
  return {
    ...ipfsContent,
    summary
  };
};

export const loadPostData = async (api: ApiPromise, postId: PostId) => {
  const postOpt = await api.query.blogs.postById(postId) as Option<Post>;
  let postData: PostData = {};

  if (postOpt.isSome) {
    const post = postOpt.unwrap();
    const content = await loadContentFromIpfs(post);
    postData = { post, initialContent: content };
  }

  return postData;
};

export const loadExtPost = async (api: ApiPromise, post: Post) => {
  const { isSharedPost, extension } = post;
  let postData: PostData = {};

  if (isSharedPost) {
    const postId = extension.value as PostId;
    const postData = await loadPostData(api, postId);
    return postData;
  }

  return postData;
};

export const loadPostDataList = async (api: ApiPromise, ids: PostId[]) => {
  const loadPostsData = ids.map(id => loadPostData(api, id));
  const postsData = await Promise.all<PostData>(loadPostsData);
  const loadPostsExtData = postsData.map(item => loadExtPost(api, item.post as Post));
  const postsExtData = await Promise.all<PostData>(loadPostsExtData);
  let posts: PostDataListItem[] = [];
  postsData.forEach((item, index) => posts.push({ postData: item, postExtData: postsExtData[index] }));
  return posts;
};
