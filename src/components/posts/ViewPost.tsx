import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Segment, Dropdown, Icon } from 'semantic-ui-react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { Option } from '@polkadot/types';

import { getJsonFromIpfs } from '../utils/OffchainUtils';
import { PostId, Post, CommentId, PostData, Change } from '../types';
import { queryBlogsToProp, SeoHeads } from '../utils/index';
import { pluralizeText, Loading } from '../utils/utils';
import { withMyAccount, MyAccountProps } from '../utils/MyAccount';
import { CommentsByPost } from './ViewComment';
import { CreatedBy } from '../utils/CreatedBy';
import { MutedSpan } from '../utils/MutedText';
import { Voter } from '../voting/Voter';
import { PostHistoryModal } from '../utils/ListsEditHistory';
import { PostVoters, ActiveVoters } from '../voting/ListVoters';
import AddressMiniDf from '../utils/AddressMiniDf';
import { api } from '@polkadot/ui-api';
import { ShareModal } from './ShareModal';
import { useRouter } from 'next/router';
import { NoData } from '../utils/DataList';
import Section from '../utils/Section';
import { Pluralize } from '../utils/Plularize';

const LIMIT_SUMMARY = 150;

type ViewPostProps = MyAccountProps & {
  preview?: boolean,
  nameOnly?: boolean,
  withLink?: boolean,
  withCreatedBy?: boolean,
  withStats?: boolean,
  withActions?: boolean,
  id: PostId,
  postById?: Option<Post>,
  commentIds?: CommentId[]
};

type PostContent = PostData & {
  summary: string;
};

function ViewPostInternal (props: ViewPostProps) {
  const { postById } = props;

  if (postById === undefined) return <Loading />;
  else if (postById.isNone) return <NoData description={<span>Post not found</span>} />;

  const {
    myAddress,
    preview = false,
    nameOnly = false,
    withLink = true,
    withActions = true,
    withStats = true,
    id,
    withCreatedBy = true
  } = props;

  const post = postById.unwrap();
  const {
    created,
    ipfs_hash,
    extension,
    isRegularPost,
    isSharedComment,
    isSharedPost
  } = post;

  const [ content , setContent ] = useState({} as PostContent);
  const [ commentsSection, setCommentsSection ] = useState(false);
  const [ postVotersOpen, setPostVotersOpen ] = useState(false);
  const [ activeVoters, setActiveVoters ] = useState(0);

  const [ originalContent, setOriginalContent ] = useState({} as PostContent);
  const [ originalPost, setOriginalPost ] = useState({} as Post);

  const openVoters = (type: ActiveVoters) => {
    setPostVotersOpen(true);
    setActiveVoters(type);
  };

  const makeSummary = (body: string) => (
    body.length > LIMIT_SUMMARY
    ? body.substr(0, LIMIT_SUMMARY) + '...'
    : body
  );

  useEffect(() => {
    if (!ipfs_hash) return;

    getJsonFromIpfs<PostData>(ipfs_hash).then(json => {
      setContent({ ...json, summary: makeSummary(json.body) });
    }).catch(err => console.log(err));

    if (isSharedPost) {
      const loadSharedPost = async () => {
        const originalPostId = extension.value as PostId;
        const originalPostOpt = await api.query.blogs.postById(originalPostId) as Option<Post>;

        if (originalPostOpt.isSome) {
          const originalPost = originalPostOpt.unwrap();
          setOriginalPost(originalPost);
          const originalContent = await getJsonFromIpfs<PostData>(originalPost.ipfs_hash);
          setOriginalContent({ ...originalContent, summary: makeSummary(originalContent.body) });
        }
      };

      loadSharedPost().catch(err => new Error(err));
    }
  }, [ ipfs_hash ]);

  const RenderDropDownMenu = () => {

    const account = isRegularPost ? post && created.account.toString() : originalPost.id && originalPost.created.account.toString();
    const isMyStruct = myAddress === account;

    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    return (<Dropdown icon='ellipsis horizontal'>
      <Dropdown.Menu>
        {isMyStruct && <Link href={`/edit-post?id=${id.toString()}`}><a className='item'>Edit</a></Link>}
        <Dropdown.Item text='View edit history' onClick={() => setOpen(true)} />
        {open && <PostHistoryModal id={id} open={open} close={close}/>}
      </Dropdown.Menu>
    </Dropdown>);
  };

  const renderNameOnly = (title: string, id: PostId) => {
    if (!title || !id) return null;
    return withLink
      ? <Link href={`/post?id=${id.toString()}`} >
        <a style={{ marginRight: '.5rem' }}>
          {title}
        </a>
      </Link>
      : <>{title}</>;
  };

  const renderPostCreator = (created: Change, size?: number) => {
    if (!created) return null;
    const { account, time, block } = created;
    return <>
      <AddressMiniDf
        value={account}
        isShort={true}
        isPadded={false}
        size={size}
        extraDetails={<Link href={`/post?id=${id.toString()}`} ><a className='DfGreyLink'>{time} at block #{block.toNumber()}</a></Link>}
      />
    </>;
  };

  const renderContent = (post: Post, content: PostContent) => {
    if (!post || !content) return null;

    const { title, summary } = content;
    return <div>
      <div className='DfPostText'>
        <h2>
          {renderNameOnly(title ? title : summary, post.id)}
        </h2>
        <div style={{ margin: '1rem 0' }}>
          <ReactMarkdown className='DfMd' source={summary} linkTarget='_blank' />
        </div>
      </div>
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
        <Icon name='comment'/>
        Comment
      </div>
      <div
        className='ui tiny button basic DfAction'
        onClick={() => setOpen(true)}
      >
        <Icon name='share square'/>
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
      <MutedSpan><div onClick={() => counts && openVoters(ActiveVoters.All)} className={counts ? '' : 'disable'}>{pluralizeText(counts, 'Reaction')}</div></MutedSpan>
      <MutedSpan><div onClick={() => setCommentsSection(!commentsSection)}>
      {pluralizeText(comments_count.toNumber(), 'Comment')}</div></MutedSpan>
      <MutedSpan><div>{pluralizeText(shares_count.toNumber(), 'Share')}</div></MutedSpan>
      <MutedSpan><Pluralize count={score.toNumber()} singularText='Point' /></MutedSpan>
    </div>
    {postVotersOpen && <PostVoters id={id} active={activeVoters} open={postVotersOpen} close={() => setPostVotersOpen(false)}/>}
    </>);
  };

  const renderRegularPreview = () => {
    return <>
      <Segment className={`DfPostPreview ${withActions && 'p-b-0'}`}>
      <div className='DfContent'>
        <div className='DfInfo'>
          <div className='DfRow'>
            {renderPostCreator(created)}
            <RenderDropDownMenu/>
          </div>
          {renderContent(post, content)}
        </div>
        {content.image && <img src={content.image} className='DfPostImagePreview' /* add onError handler */ />}
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
            {renderPostCreator(created)}
            <RenderDropDownMenu/>
          </div>
        <div className='DfSharedSummary'>{renderNameOnly(content.summary, id)}</div>
        {/* TODO add body*/}
        <Segment className='DfPostPreview'>
          <div className='DfContent'>
            <div className='DfInfo'>
              <div className='DfRow'>
                {renderPostCreator(originalPost.created)}
                <RenderDropDownMenu/>
              </div>
              {renderContent(originalPost, originalContent)}
            </div>
            {originalContent.image && <img src={originalContent.image} className='DfPostImagePreview' /* add onError handler */ />}
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

  const renderDetails = (content: PostContent) => {
    const { title, body, image } = content;
    return <Section>
      <SeoHeads title={title} name={title} desc={body} image={image} />
      <h1 style={{ display: 'flex' }}>
        <span style={{ marginRight: '.5rem' }}>{title}</span>
        <RenderDropDownMenu/>
      </h1>
      {renderStatsPanel(post)}
      {withCreatedBy && <CreatedBy created={post.created} />}
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
  } else if (isRegularPost) {
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
}

export const ViewPost = withMulti(
  ViewPostInternal,
  withMyAccount,
  withCalls<ViewPostProps>(
    queryBlogsToProp('postById', 'id')
  )
);

export function ViewPostById () {
  const router = useRouter();
  const { id } = router.query;
  try {
    return <ViewPost id={new PostId(id as string)}/>;
  } catch (err) {
    return <em>Invalid Id: {id}</em>;
  }
}
