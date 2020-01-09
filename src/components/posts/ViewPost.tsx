import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Segment } from 'semantic-ui-react';

import { withCalls, withMulti, withApi } from '@polkadot/ui-api/with';
import { Option } from '@polkadot/types';

import { getJsonFromIpfs } from '../utils/OffchainUtils';
import { PostId, Post, CommentId, PostContent } from '../types';
import { queryBlogsToProp, SeoHeads } from '../utils/index';
import { Loading } from '../utils/utils';
import { CommentsByPost } from './ViewComment';
import { MutedSpan } from '../utils/MutedText';
import { Voter } from '../voting/Voter';
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

const LIMIT_SUMMARY = isMobile ? 75 : 150;

type ViewPostProps = ApiProps & {
  preview?: boolean,
  nameOnly?: boolean,
  withLink?: boolean,
  withCreatedBy?: boolean,
  withStats?: boolean,
  withActions?: boolean,
  withBlogName?: boolean,
  id: PostId,
  post?: Post,
  postById?: Option<Post>,
  commentIds?: CommentId[],
  initialContent?: PostContent
};

type PostExtContent = PostContent & {
  summary: string;
};

const ViewPostPage: NextPage<ViewPostProps> = (props: ViewPostProps) => {
  const { post } = props;

  if (!post) return <NoData description={<span>Post not found</span>} />;

  const {
    preview = false,
    nameOnly = false,
    withBlogName = false,
    withLink = true,
    withActions = true,
    withStats = true,
    id,
    api,
    withCreatedBy = true,
    initialContent
  } = props;

  const {
    created,
    ipfs_hash,
    extension,
    isRegularPost,
    isSharedComment,
    isSharedPost,
    edit_history
  } = post;

  console.log(post);
  const makeSummary = (body: string) => (
    body.length > LIMIT_SUMMARY
    ? body.substr(0, LIMIT_SUMMARY) + '...'
    : body
  );

  const initContent = initialContent ? { ...initialContent, summary: makeSummary(initialContent.body) } : {} as PostExtContent;
  const { state: { address } } = useMyAccount();
  const [ content , setContent ] = useState(initContent);
  const [ commentsSection, setCommentsSection ] = useState(false);
  const [ postVotersOpen, setPostVotersOpen ] = useState(false);
  const [ activeVoters, setActiveVoters ] = useState(0);

  const [ originalContent, setOriginalContent ] = useState({} as PostExtContent);
  const [ originalPost, setOriginalPost ] = useState({} as Post);

  const openVoters = (type: ActiveVoters) => {
    setPostVotersOpen(true);
    setActiveVoters(type);
  };
  useEffect(() => {
    if (!ipfs_hash) return;
    let isSubsribe = true;
    getJsonFromIpfs<PostExtContent>(ipfs_hash).then(json => {
      isSubsribe && setContent({ ...json, summary: makeSummary(json.body) });
    }).catch(err => console.log(err));

    if (isSharedPost) {
      const loadSharedPost = async () => {
        const originalPostId = extension.value as PostId;
        const originalPostOpt = await api.query.blogs.postById(originalPostId) as Option<Post>;

        if (originalPostOpt.isSome) {
          const originalPost = originalPostOpt.unwrap();
          const originalContent = await getJsonFromIpfs<PostExtContent>(originalPost.ipfs_hash);
          if (isSubsribe) {
            setOriginalPost(originalPost);
            setOriginalContent({ ...originalContent, summary: makeSummary(originalContent.body) });
          }
        }
      };

      loadSharedPost().catch(err => new Error(err));
    }
    return () => { isSubsribe = false; };
  }, [ false ]);

  const RenderDropDownMenu = () => {

    const account = isRegularPost ? post && created.account.toString() : originalPost.id && originalPost.created.account.toString();
    const isMyStruct = address === account;

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
      <div className='DfAction'><Voter struct={post} /></div>
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
      {open && <ShareModal postId={isRegularPost ? id : originalPost.id} open={open} close={close} />}
    </div>);
  };

  const renderStatsPanel = (post: Post) => {
    if (post.id === undefined) return null;

    const { upvotes_count, downvotes_count, comments_count, shares_count, score } = post;
    const counts = downvotes_count.toNumber() + upvotes_count.toNumber();
    return (<>
    <div className='DfCountsPreview'>
      {!extension.value && <MutedSpan><div onClick={() => counts && openVoters(ActiveVoters.All)} className={counts ? '' : 'disable'}><Pluralize count={counts} singularText='Reaction'/></div></MutedSpan>}
      <MutedSpan><div onClick={() => setCommentsSection(!commentsSection)}>
      <Pluralize count={comments_count.toNumber()} singularText='Comment'/></div></MutedSpan>
      <MutedSpan><div><Pluralize count={shares_count.toNumber()} singularText='Share'/></div></MutedSpan>
      <MutedSpan><Pluralize count={score.toNumber()} singularText='Point' /></MutedSpan>
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
          <RenderDropDownMenu/>
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
    return <>
      <Segment className={`DfPostPreview ${withActions && 'p-b-0'}`}>
          <div className='DfRow'>
            {renderPostCreator(post)}
            <RenderDropDownMenu/>
          </div>
        <div className='DfSharedSummary'>{renderNameOnly(content.summary, id)}</div>
        {/* TODO add body*/}
        <Segment className='DfPostPreview'>
          <div className='DfInfo'>
            <div className='DfRow'>
              {renderPostCreator(originalPost)}
              <RenderDropDownMenu/>
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
        <RenderDropDownMenu/>
      </div>
      {renderStatsPanel(post)}
      {withCreatedBy && renderPostCreator(post)}
      <div style={{ margin: '1rem 0' }}>
        {image && <img src={image} className='DfPostImage' /* add onError handler */ />}
        <ReactMarkdown className='DfMd details' source={body} linkTarget='_blank' />
        {/* TODO render tags */}
      </div>
      <Voter struct={post} />
      {/* <ShareButtonPost postId={post.id}/> */}
      <CommentsByPost postId={post.id} post={post} />
    </Section>;
  };

  const renderSharedDetails = () => (renderSharedPreview());

  if (nameOnly) {
    return renderNameOnly(content.title,id);
  } else if (isRegularPost || !extension.value) {
    if (preview) {
      return renderRegularPreview();
    } else {
      return renderDetails(content);
    }
  } else if (isSharedPost) {
    return preview
      ? renderSharedPreview()
      : renderSharedDetails();
  } else if (isSharedComment) {
    return <div>Shared Comment is not implemented</div>;
  } else {
    return <div>You should not be here!!!</div>;
  }
};

ViewPostPage.getInitialProps = async (props): Promise<any> => {
  const { query: { id }, req } = props;
  console.log('Initial', props.query);
  const api = req ? await Api.setup() : webApi;
  const postIdOpt = await api.query.blogs.postById(id) as Option<Post>;
  const post = postIdOpt.isSome && postIdOpt.unwrap();
  const content = post && await getJsonFromIpfs<PostExtContent>(post.ipfs_hash);
  Api.destroy();
  return {
    post: post,
    initialContent: content
  };
};

export default ViewPostPage;

const withUnwrap = (Component: React.ComponentType<ViewPostProps>) => {
  return (props: ViewPostProps) => {
    const { postById } = props;
    if (!postById) return <Loading/>;

    const post = postById.unwrap();

    return <Component post={post} {...props}/>;
  };
};

export const ViewPost = withMulti(
  ViewPostPage,
  withCalls<ViewPostProps>(
    queryBlogsToProp('postById', 'id')
  ),
  withUnwrap,
  withApi
);
