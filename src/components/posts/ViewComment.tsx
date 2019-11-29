import { Comment as SuiComment, Dropdown } from 'semantic-ui-react';
import React, { useState, useEffect } from 'react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import Section from '../utils/Section';
import AddressMini from '../utils/AddressMiniDf';
import { useMyAccount } from '../utils/MyAccountContext';
import { ApiProps } from '@polkadot/ui-api/types';
import { api } from '@polkadot/ui-api';
import { Option } from '@polkadot/types';
import moment from 'moment-timezone';

import { getJsonFromIpfs } from '../utils/OffchainUtils';
import { partition } from 'lodash';
import { PostId, CommentId, Comment, OptionComment, CommentData, PostData, Post } from '../types';
import { NewComment } from './EditComment';
import { queryBlogsToProp, SeoHeads } from '../utils/index';
import { Voter } from '../voting/Voter';
import { CommentHistoryModal } from '../utils/ListsEditHistory';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/router';
import { MutedDiv } from '../utils/MutedText';
import Link from 'next/link';
import { Pluralize } from '../utils/Plularize';
import { Loading } from '../utils/utils';

type Props = ApiProps & {
  postId: PostId,
  commentIds?: CommentId[],
  commentIdForPage?: CommentId
};

const renderLevelOfComments = (parentComments: Comment[], childrenComments: Comment[]) => {
  return parentComments.map((comment, i) =>
  <ViewComment key={i} comment={comment} commentsWithParentId={childrenComments} />);
};

export function CommentsTree (props: Props) {
  const {
    postId,
    commentIds = [],
    commentIdForPage
  } = props;

  const commentsCount = commentIds.length;// post.comments_count.toNumber();
  const [loaded, setLoaded] = useState(false);
  const [comments, setComments] = useState(new Array<Comment>());

  useEffect(() => {
    const loadComments = async () => {
      if (!commentsCount) return;
      const apiCalls: Promise<OptionComment>[] = commentIds.map(id =>
        api.query.blogs.commentById(id) as Promise<OptionComment>);

      const loadedComments = (await Promise.all<OptionComment>(apiCalls)).map(x => x.unwrap() as Comment);

      setComments(loadedComments);
      setLoaded(true);
    };

    loadComments().catch(err => console.log(err));
  }, [ commentsCount ]);// TODO change dependense on post.comments_counts or CommentCreated, CommentUpdated with current postId

  const isPage = commentIdForPage ? true : false;

  const renderComments = () => {
    if (!commentsCount) {
      return <></>;
    }

    if (!loaded) {
      return <div style={{ marginTop: '1rem' }}><Loading /></div>;
    }

    const [parentComments, childrenComments] = partition(comments, e => e.parent_id.isNone);
    if (commentIdForPage !== undefined) {
      const [comment, childrenComments] = partition(comments, (e) => e.id.eq(commentIdForPage));
      return <ViewComment comment={comment[0]} commentsWithParentId={childrenComments} isPage/>;
    } else {
      return <>{renderLevelOfComments(parentComments, childrenComments)}</>;
    }
  };

  const RenderCommentsOnPost = () => (
    <Section className='DfCommentsByPost'>
      <h4><Pluralize count={commentsCount} singularText='comment' /></h4>
      <div id={`comments-on-post-${postId}`}>
        {<NewComment postId={postId}/>}
        {renderComments()}
      </div>
    </Section>
  );

  const RenderCommentPage = () => (
    <Section>
      {renderComments()}
    </Section>
  );

  return isPage ? <RenderCommentPage/> : <RenderCommentsOnPost/>;
}

export const CommentsByPost = withMulti(
  CommentsTree,
  withCalls<Props>(
    queryBlogsToProp('commentIdsByPostId', { paramName: 'postId', propName: 'commentIds' })
  )
);

export function withIdsFromUrl (Component: React.ComponentType<Props>) {
  return function (props: Props) {
    const router = useRouter();
    const { postId, commentId } = router.query;
    try {
      return <Component postId={new PostId(postId as string)} commentIdForPage={new CommentId(commentId as string)} {...props}/>;
    } catch (err) {
      return <em>Invalid url</em>;
    }
  };
}

export const CommentPage = withMulti(
  CommentsTree,
  withIdsFromUrl,
  withCalls<Props>(
    queryBlogsToProp('commentIdsByPostId', { paramName: 'postId', propName: 'commentIds' })
  )
);

type ViewCommentProps = {
  comment: Comment,
  commentsWithParentId: Comment[],
  isPage?: boolean
};

export function ViewComment (props: ViewCommentProps) {

  const { comment, commentsWithParentId, isPage = false } = props;
  const { state: { address: myAddress } } = useMyAccount();
  const [parentComments, childrenComments] = partition(commentsWithParentId, (e) => e.parent_id.eq(comment.id));

  const { id, score, created: { account, time }, post_id } = comment;
  const [ struct , setStruct ] = useState(comment);
  const [ postContent, setPostContent ] = useState({} as PostData);
  const [ content , setContent ] = useState({} as CommentData);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [doReloadComment, setDoReloadComment] = useState(true);

  // const reactionKind = reactionState ? reactionState.kind.toString() : 'None';
  if (!comment || comment.isEmpty) {
    return null;
  }
  useEffect(() => {

    if (!doReloadComment) return;

    getJsonFromIpfs<CommentData>(struct.ipfs_hash).then(json => {
      setContent(json);
    }).catch(err => console.log(err));

    const loadComment = async () => {
      const result = await api.query.blogs.commentById(id) as OptionComment;
      if (result.isNone) return;
      const comment = result.unwrap() as Comment;
      setStruct(comment);

      setDoReloadComment(false);
    };
    loadComment().catch(console.log);

    const loadPostContent = async () => {
      const result = await api.query.blogs.postById(post_id) as Option<Post>;
      if (result.isNone) return;
      const post = result.unwrap();
      const content = await getJsonFromIpfs<PostData>(post.ipfs_hash);
      setPostContent(content);

      setDoReloadComment(false);
    };
    loadPostContent().catch(console.log);

  },[ doReloadComment ]);

  const isMyStruct = myAddress === account.toString();

  const RenderDropDownMenu = () => {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (<Dropdown icon='ellipsis horizontal' style={{ marginLeft: '.5rem', color: '#8c8c8c' }} >
      <Dropdown.Menu>
        {(isMyStruct || showEditForm) && <Dropdown.Item text='Edit' onClick={() => setShowEditForm(true)} />}
        <Dropdown.Item text='View edit history' onClick={() => setOpen(true)} />
        {open && <CommentHistoryModal id={id} open={open} close={close}/>}
      </Dropdown.Menu>
    </Dropdown>);
  };

  const replyButton = () => (
    <span
      onClick={() => setShowReplyForm(true)}
      className='reply'
    >
      Reply
    </span>
  );

  const responseTitle = <>In response to <Link href={`/post?id=${post_id.toString()}`}><a>{postContent.title}</a></Link></>;

  return <div id={`comment-${id}`} className='DfComment'>
    {isPage && <>
      <SeoHeads name={`In response to ${postContent.title}`} desc={content.body} title={`${account} commented on ${postContent.title}`} />
    <MutedDiv style={{ marginTop: '1rem' }}>{responseTitle}</MutedDiv>
    </>}
    <SuiComment.Group threaded>
    <SuiComment>
      <div className='DfCommentContent'>
        <SuiComment.Metadata>
          <AddressMini
            value={account}
            isShort={true}
            isPadded={false}
            size={32}
            extraDetails={<Link href={`/comment?postId=${struct.post_id.toString()}&&commentId=${id.toString()}`}><a className='DfGreyLink'>{`${moment(time).fromNow()} · comment score: ${score}`}</a></Link>}
          />
        </SuiComment.Metadata>
        <SuiComment.Content>
          {showEditForm
            ? <NewComment
              struct={struct}
              id={struct.id}
              postId={struct.post_id}
              json={content.body}
              onSuccess={() => { setShowEditForm(false); setDoReloadComment(true); }}
            />
            : <>
              <SuiComment.Text>
                <ReactMarkdown className='DfMd' source={content.body} linkTarget='_blank' />
              </SuiComment.Text>
              <SuiComment.Actions>
                {showReplyForm
                ? <SuiComment.Action>
                    <NewComment
                          postId={struct.post_id}
                          parentId={struct.id}
                          onSuccess={() => setShowReplyForm(false)}
                          autoFocus={true}
                    />
                  </SuiComment.Action>
                : <>
                  <SuiComment.Action>
                  <Voter struct={struct} />
                  </SuiComment.Action>
                  <SuiComment.Action>
                    {replyButton()}
                  </SuiComment.Action>
                  <SuiComment.Action>
                    <RenderDropDownMenu />
                  </SuiComment.Action>
                </>}
              </SuiComment.Actions>
            </>}
        </SuiComment.Content>
      </div>
      <div className={'ChildComment'}>{renderLevelOfComments(parentComments, childrenComments)}</div>
    </SuiComment>
  </SuiComment.Group>
</div>;
}
