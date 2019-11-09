import { Comment as SuiComment, Button, Dropdown } from 'semantic-ui-react';
import React, { useState, useEffect } from 'react';

import { withCalls, withMulti, withApi } from '@polkadot/ui-api/with';
import Section from '../utils/Section';
import AddressMini from '../utils/AddressMiniDf';
import { useMyAccount } from '../utils/MyAccountContext';
import { ApiProps } from '@polkadot/ui-api/types';
import { ApiPromise } from '@polkadot/api';
import { api } from '@polkadot/ui-api';

import { getJsonFromIpfs } from '../utils/OffchainUtils';
import { partition } from 'lodash';
import { PostId, CommentId, Comment, OptionComment, Post, CommentData } from '../types';
import { NewComment } from './EditComment';
import { queryBlogsToProp } from '../utils/index';
import { Voter } from '../voting/Voter';
import { CommentHistoryModal } from '../utils/ListsEditHistory';
import ReactMarkdown from 'react-markdown';

type Props = ApiProps & {
  postId: PostId,
  post: Post,
  commentIds?: CommentId[]
};

const renderLevelOfComments = (parentComments: Comment[], childrenComments: Comment[]) => {
  return parentComments.map((comment, i) =>
  <ViewComment key={i} comment={comment} commentsWithParentId={childrenComments} api={api}/>);
};

function InnerCommentsByPost (props: Props) {
  const {
    api,
    postId,
    commentIds = []
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

  const renderComments = () => {
    if (!commentsCount) {
      return null;
    }

    if (!loaded) {
      return <div style={{ marginTop: '1rem' }}><em>Loading comments...</em></div>;
    }

    const [parentComments, childrenComments] = partition(comments, e => e.parent_id.isNone);
    return renderLevelOfComments(parentComments, childrenComments);
  };

  return (
      <Section title={`Comments (${commentsCount})`} className='DfCommentsByPost'>
        <div id={`comments-on-post-${postId}`}>
          <NewComment postId={postId}/>
          {renderComments()}
        </div>
      </Section>);
}

export const CommentsByPost = withMulti(
  InnerCommentsByPost,
  withApi,
  withCalls<Props>(
    queryBlogsToProp('commentIdsByPostId', { paramName: 'postId', propName: 'commentIds' })
  )
);

type ViewCommentProps = {
  api: ApiPromise,
  comment: Comment,
  commentsWithParentId: Comment[];
};

export function ViewComment (props: ViewCommentProps) {

  const { api, comment, commentsWithParentId } = props;
  const { state: { address: myAddress } } = useMyAccount();
  const [parentComments, childrenComments] = partition(commentsWithParentId, (e) => e.parent_id.eq(comment.id));

  const { id, score, created: { account, block, time } } = comment;
  const [ struct , setStruct ] = useState(comment);
  const [ content , setContent ] = useState({} as CommentData);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [doReloadComment, setDoReloadComment] = useState(false);
  // const reactionKind = reactionState ? reactionState.kind.toString() : 'None';
  if (!comment || comment.isEmpty) {
    return null;
  }
  useEffect(() => {

    getJsonFromIpfs<CommentData>(struct.ipfs_hash).then(json => {
      setContent(json);
    }).catch(err => console.log(err));

    if (!doReloadComment) return;

    const loadComment = async () => {
      const result = await api.query.blogs.commentById(id) as OptionComment;
      if (result.isNone) return;
      const comment = result.unwrap() as Comment;
      setStruct(comment);

      setDoReloadComment(false);
    };
    loadComment().catch(err => console.log(err));

  },[ doReloadComment ]);

  const isMyStruct = myAddress === account.toString();

  const renderDropDownMenu = () => {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (<Dropdown icon='ellipsis horizontal'>
      <Dropdown.Menu>
        {(isMyStruct || showEditForm) && <Dropdown.Item text='Edit' onClick={() => setShowEditForm(true)} />}
        <Dropdown.Item text='View edit history' onClick={() => setOpen(true)} />
        {open && <CommentHistoryModal id={id} open={open} close={close}/>}
      </Dropdown.Menu>
    </Dropdown>);
  };

  const replyButton = () => (
    <Button
      type='button'
      basic
      size='tiny'
      onClick={() => setShowReplyForm(true)}
      content='Reply'
    />);

  return <div id={`comment-${id}`}>
    <SuiComment.Group threaded>
    <SuiComment>
      <div className='DfCommentBox'>
        <Voter
          struct={struct}
        />
        <div>
          <SuiComment.Metadata>
            <AddressMini
              value={account}
              isShort={true}
              isPadded={false}
              size={28}
              extraDetails={`${time.toLocaleString()} at block #${block.toNumber()}, comment score: ${score}` }
            />
            {renderDropDownMenu()}
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
                  <SuiComment.Action>
                    {/* <ShareButtonComment commentId={id}/> */}
                    {showReplyForm
                      ? <NewComment
                          postId={struct.post_id}
                          parentId={struct.id}
                          onSuccess={() => setShowReplyForm(false)}
                          autoFocus={true}
                      />
                      : replyButton()
                    }
                  </SuiComment.Action>
                </SuiComment.Actions>
              </>}
          </SuiComment.Content>
        </div>
      </div>
        {renderLevelOfComments(parentComments, childrenComments)}
    </SuiComment>
  </SuiComment.Group>
</div>;
}
