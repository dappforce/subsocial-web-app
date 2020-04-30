import { Comment as SuiComment } from 'semantic-ui-react';
import React, { useState, useEffect } from 'react';

import { withCalls, withMulti } from '@polkadot/react-api';
import Section from '../utils/Section';
import { useMyAccount } from '../utils/MyAccountContext';
import { ApiProps } from '@polkadot/react-api/types';
import moment from 'moment-timezone';
import mdToText from 'markdown-to-txt';
import isEmpty from 'lodash.isempty';
import partition from 'lodash.partition'
import { NewComment } from './EditComment';
import { socialQueryToProp } from '../utils/index';
import { HeadMeta } from '../utils/HeadMeta';
import { Voter } from '../voting/Voter';
// import { CommentHistoryModal } from '../utils/ListsEditHistory';
import { DfMd } from '../utils/DfMd';
import { MutedDiv } from '../utils/MutedText';
import Link from 'next/link';
import { Pluralize, pluralize } from '../utils/Plularize';
import { Loading, formatUnixDate } from '../utils/utils';
import { Icon, Menu, Dropdown } from 'antd';
import { NextPage } from 'next';
import BN from 'bn.js'
import { CommentId, Post, Comment } from '@subsocial/types/substrate/interfaces';
import { PostContent, CommentContent } from '@subsocial/types/offchain';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { newLogger, nonEmptyStr } from '@subsocial/utils';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import { AuthorPreviewWithOwner } from '../profiles/address-views';

const log = newLogger('View comment')

type Props = ApiProps & {
  postId: BN;
  commentIds?: CommentId[];
  commentIdForPage?: CommentId;
};

const renderLevelOfComments = (parentComments: Comment[], childrenComments: Comment[]) => {
  return parentComments.map((comment) =>
    <ViewComment key={comment.id.toString()} comment={comment} commentsWithParentId={childrenComments} />);
};

export function CommentsTree (props: Props) {
  const {
    postId,
    commentIds = [],
    commentIdForPage
  } = props;
  // eslint-disable-next-line no-undef
  const { substrate } = useSubsocialApi()
  const commentsCount = commentIds.length;// post.comments_count.toNumber();
  const [ loaded, setLoaded ] = useState(false);
  const [ comments, setComments ] = useState(new Array<Comment>());

  useEffect(() => {
    let isSubscribe = true;

    const loadComments = async () => {
      if (!commentsCount) return;

      const loadedComments = await substrate.findComments(commentIds);

      if (isSubscribe) {
        setComments(loadedComments);
        setLoaded(true);
      }
    };

    loadComments().catch(err => log.error('Failed to load comments:', err));

    return () => { isSubscribe = false; };
  }, [ commentsCount ]);// TODO change dependency to post.comments_counts or CommentCreated, CommentUpdated with the current postId

  const isPage = !!commentIdForPage;

  const renderComments = () => {
    if (!commentsCount) {
      return <></>;
    }

    if (!loaded) {
      return <div style={{ marginTop: '1rem' }}><Loading /></div>;
    }

    const [ parentComments, childrenComments ] = partition(comments, e => e.parent_id.isNone);
    if (commentIdForPage !== undefined) {
      const [ comment, childrenComments ] = partition(comments, (e) => e.id.eq(commentIdForPage));
      return <ViewComment comment={comment[0]} commentsWithParentId={childrenComments} isPage/>;
    } else {
      return <>{renderLevelOfComments(parentComments, childrenComments)}</>;
    }
  };

  const RenderCommentsOnPost = () => (
    <div className='DfCommentsByPost'>
      <h3><Pluralize count={commentsCount} singularText='comment' /></h3>
      <div id={`comments-on-post-${postId}`}>
        {<NewComment postId={postId}/>}
        {renderComments()}
      </div>
    </div>
  );

  const RenderCommentPage = () => (
    <Section>
      {renderComments()}
    </Section>
  );

  return isPage ? <RenderCommentPage/> : <RenderCommentsOnPost/>;
}

export default withMulti(
  CommentsTree,
  withCalls<Props>(
    socialQueryToProp('commentIdsByPostId', { paramName: 'postId', propName: 'commentIds' })
  )
);

type ViewCommentProps = {
  comment: Comment;
  commentsWithParentId: Comment[];
  isPage?: boolean;
  post?: Post;
  postContent?: PostContent;
  commentContent?: CommentContent;
};

export const ViewComment: NextPage<ViewCommentProps> = (props: ViewCommentProps) => {
  const {
    comment,
    commentsWithParentId,
    isPage = false,
    post: initialPost = {} as Post,
    postContent: initialPostContent = {} as PostContent,
    commentContent = {} as CommentContent
  } = props;

  const { substrate, ipfs } = useSubsocialApi()
  const { state: { address: myAddress } } = useMyAccount();
  const [ parentComments, childrenComments ] = partition(commentsWithParentId, (e) => e.parent_id.eq(comment.id));

  const { id, score, created: { account, time }, post_id } = comment;
  const [ struct, setStruct ] = useState(comment);
  const [ post, setPost ] = useState(initialPost);
  const [ postContent, setPostContent ] = useState(initialPostContent);
  const [ content, setContent ] = useState(commentContent);
  const [ showEditForm, setShowEditForm ] = useState(false);
  const [ showReplyForm, setShowReplyForm ] = useState(false);
  const [ doReloadComment, setDoReloadComment ] = useState(true);

  // const reactionKind = reactionState ? reactionState.kind.toString() : 'None';
  if (!comment || comment.isEmpty) {
    return null;
  }

  useEffect(() => {
    let isSubscribe = true;

    ipfs.findComment(struct.ipfs_hash.toString()).then(json => {
      isSubscribe && json && setContent(json);
    }).catch(err => log.error('Failed to find a comment in IPFS:', err));

    const loadComment = async () => {
      const comment = await substrate.findComment(id);
      if (isSubscribe) {
        comment && setStruct(comment);
      }
    };
    loadComment().catch(err => log.error('Failed to load comment:', err));

    const loadPostContent = async () => {
      if (isEmpty(post)) {
        const post = await substrate.findPost(post_id);
        isSubscribe && post && setPost(post);
      }
      const content = await ipfs.findPost(post.ipfs_hash.toString());
      if (isSubscribe && content) {
        setPostContent(content);
      }
    };
    loadPostContent().catch(err => log.error('Failed to load post content:', err));

    return () => { isSubscribe = false; };
  }, [ doReloadComment ]);

  const isMyStruct = myAddress === account.toString();

  const RenderDropDownMenu = () => {
    // const [ open, setOpen ] = useState(false);
    // const close = () => setOpen(false);
    // console.log(open, close());
    const showDropdown = isMyStruct;

    const menu = (
      <Menu>
        {(isMyStruct || showEditForm) && <Menu.Item key='0'>
          <div onClick={() => setShowEditForm(true)} >Edit</div>
        </Menu.Item>}
        {/* {edit_history.length > 0 && <Menu.Item key='1'>
          <div onClick={() => setOpen(true)} >View edit history</div>
        </Menu.Item>} */}
      </Menu>
    );

    return (<>{showDropdown &&
    <Dropdown overlay={menu} placement='bottomRight'>
      <Icon type='ellipsis' />
    </Dropdown>}
    {/* open && <CommentHistoryModal id={id} open={open} close={close} /> */}
    </>);
  };

  const replyButton = () => (
    <span
      onClick={() => setShowReplyForm(true)}
      className='reply'
    >
      Reply
    </span>
  );

  const componentContent = <div id={`comment-${id}`} className='DfComment'>
    <SuiComment.Group threaded>
      <SuiComment>
        <div className='DfCommentContent'>
          <SuiComment.Metadata>
            <AuthorPreviewWithOwner
              address={account}
              isShort={true}
              isPadded={false}
              size={32}
              details={
                <span>
                  <Link href={`/comment?postId=${struct.post_id.toString()}&commentId=${id.toString()}`}>
                    <a className='DfGreyLink'>{moment(formatUnixDate(time)).fromNow()}</a>
                  </Link>
                  {' · '}
                  {pluralize(score, 'Point')}
                </span>
              }
            />
          </SuiComment.Metadata>
          <SuiComment.Content>
            {showEditForm
              ? <NewComment
                struct={struct}
                id={struct.id}
                postId={struct.post_id}
                json={content.body}
                onSuccess={() => {
                  setShowEditForm(false)
                  setDoReloadComment(!doReloadComment)
                }}
              />
              : <>
                {nonEmptyStr(content.body) &&
                  <SuiComment.Text>
                    <DfMd source={content.body} />
                  </SuiComment.Text>
                }
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
                        <Voter struct={struct} type={'Comment'} />
                      </SuiComment.Action>
                      <SuiComment.Action>
                        {replyButton()}
                      </SuiComment.Action>
                      <SuiComment.Action>
                        <RenderDropDownMenu />
                      </SuiComment.Action>
                    </>
                  }
                </SuiComment.Actions>
              </>}
          </SuiComment.Content>
        </div>
        <div className={'ChildComment'}>
          {renderLevelOfComments(parentComments, childrenComments)}
        </div>
      </SuiComment>
    </SuiComment.Group>
  </div>

  const renderResponseTitle = () => <>
    In response to{' '}
    <Link
      href='/blogs/[blogId]/posts/[postId]'
      as={`/blogs/${post.blog_id}/posts/${post_id.toString()}`}
    >
      <a>{postContent.title}</a>
    </Link>
  </>

  const bodyAsText = mdToText(content.body);

  return isPage
    ? (
      <Section>
        <HeadMeta desc={bodyAsText} title={`${account} commented on ${postContent.title}`} />
        <MutedDiv>{renderResponseTitle()}</MutedDiv>
        <div className='mt-3'>{componentContent}</div>
      </Section>
    )
    : componentContent
};

ViewComment.getInitialProps = async (props): Promise<ViewCommentProps> => {
  const { query: { commentId } } = props;
  const subsocial = await getSubsocialApi()
  const commentData = await subsocial.findComment(new BN(commentId as string));
  const postData = commentData?.struct && await subsocial.findPost(commentData.struct.post_id);

  return {
    post: postData?.struct,
    postContent: postData?.content,
    comment: commentData?.struct || {} as Comment,
    commentContent: commentData?.content,
    commentsWithParentId: [] as Comment[],
    isPage: true
  };
};
