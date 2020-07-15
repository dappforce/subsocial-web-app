import { PostId, Space, Post } from '@subsocial/types/substrate/interfaces';
import { PostWithSomeDetails } from '@subsocial/types';
import React, { useState } from 'react'
import { nonEmptyArr, newLogger } from '@subsocial/utils';
import ListData from '../utils/DataList';
import ViewComment from './ViewComment';
import { useSelector, useDispatch } from 'react-redux';
import { getComments } from 'src/redux/slices/replyIdsByPostIdSlice';
import { Store } from 'src/redux/types';
import { useSetReplyToStore } from './utils';
import useSubsocialEffect from '../api/useSubsocialEffect';
import { useLoadHiddenPostByOwner } from '../spaces/helpers';
import { Loading } from '../utils';

const log = newLogger('CommentTree')

type LoadProps = {
  parent: Post,
  space: Space,
  replies?: PostWithSomeDetails[],
  replyIds?: PostId[],
  hiddenReplies?: PostWithSomeDetails[]
}

type CommentsTreeProps = {
  space: Space,
  comments: PostWithSomeDetails[]
}

const ViewCommentsTree: React.FunctionComponent<CommentsTreeProps> = ({ comments, space }) => {
  return nonEmptyArr(comments) ? <ListData
    dataSource={comments}
    paginationOff
    renderItem={(item) => {
      const { post: { struct } } = item;
      const key = `comment-${struct.id.toString()}`
      return <ViewComment key={key} space={space} comment={item} />
    }}
  /> : null;
}

export const DynamicCommentsTree = (props: LoadProps) => {
  const { parent: { id: parentId }, space, replyIds, hiddenReplies = [], replies } = props;
  const parentIdStr = parentId.toString()
  const [ replyComments, setComments ] = useState<PostWithSomeDetails[]>(replies || []);
  const dispatch = useDispatch()

  useSubsocialEffect(({ subsocial, substrate }) => {

    const loadComments = async () => {
      const replyIds = await substrate.getReplyIdsByPostId(parentId);
      const comments = await subsocial.findVisiblePostsWithAllDetails(replyIds) as any;
      const replyIdsStr = replyIds.map(x => x.toString())
      setComments(comments)
      useSetReplyToStore(dispatch, { reply: { replyId: replyIdsStr, parentId: parentIdStr }, comment: comments })
    }

    if (nonEmptyArr(replyIds) && nonEmptyArr(replies)) {
      useSetReplyToStore(dispatch, { reply: { replyId: replyIds.map(x => x.toString()), parentId: parentIdStr }, comment: replyComments })
    } else {
      loadComments().catch(err => log.error('Failed to load comments: %o', err))
    }

  }, [ dispatch ]);

  return <ViewCommentsTree space={space} comments={[ ...replyComments, ...hiddenReplies ]} />;
}

export const CommentsTree = (props: LoadProps) => {
  const { parent: { created: { account }, id }, space, replyIds } = props;
  const [ commentIds, setCommentIds ] = useState<PostId[]>(replyIds || [])

  useSubsocialEffect(({ substrate }) => {
    if (nonEmptyArr(commentIds)) return

    substrate.getReplyIdsByPostId(id).then(setCommentIds).catch(err => console.error(err))
  })

  const { myHiddenPosts, isLoading } = useLoadHiddenPostByOwner({ owner: account, postIds: commentIds })

  const comments = useSelector((store: Store) => getComments(store, id.toString()));
  const allReplies = [ comments, ...myHiddenPosts ] as PostWithSomeDetails[]

  if (isLoading) return <Loading />

  return nonEmptyArr(comments)
    ? <ViewCommentsTree space={space} comments={allReplies} />
    : <DynamicCommentsTree {...props} hiddenReplies={myHiddenPosts} />
}
