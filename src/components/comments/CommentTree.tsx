import { Post, Space } from '@subsocial/types/substrate/interfaces';
import { PostWithSomeDetails } from '@subsocial/types';
import React, { useState, useCallback } from 'react'
import { nonEmptyArr, newLogger } from '@subsocial/utils';
import ViewComment from './ViewComment';
import { useSelector, useDispatch } from 'react-redux';
import { getComments } from 'src/redux/slices/replyIdsByPostIdSlice';
import { Store } from 'src/redux/types';
import { useSetReplyToStore } from './utils';
import useSubsocialEffect from '../api/useSubsocialEffect';
import { LoadingOutlined } from '@ant-design/icons';
import { MutedDiv } from '../utils/MutedText';
import { isFakeId } from './helpers';
import DataList from '../lists/DataList';
import { ZERO, resolveBn } from '../utils';

const log = newLogger('CommentTree')

type LoadProps = {
  rootPost?: Post,
  parent: Post,
  space: Space,
  replies?: PostWithSomeDetails[]
}

type CommentsTreeProps = {
  rootPost?: Post,
  space: Space,
  comments: PostWithSomeDetails[]
}

const ViewCommentsTree: React.FunctionComponent<CommentsTreeProps> = ({ comments, rootPost, space }) => {
  return nonEmptyArr(comments) ? <DataList
    dataSource={comments}
    renderItem={(item) => {
      const { post: { struct } } = item;
      const key = `comment-${struct.id.toString()}`
      return <ViewComment key={key} space={space} rootPost={rootPost} comment={item} withShowReplies/>
    }}
  /> : null;
}

export const DynamicCommentsTree = (props: LoadProps) => {
  const { rootPost, parent: { id: parentId }, space, replies } = props;
  const parentIdStr = parentId.toString()

  if (isFakeId(props.parent)) return null

  const dispatch = useDispatch()

  const [ isLoading, setIsLoading ] = useState(true)
  const [ replyComments, setComments ] = useState(replies || []);

  useSubsocialEffect(({ subsocial, substrate }) => {
    if (!isLoading) return;

    let isSubscribe = true

    const loadComments = async () => {
      const replyIds = await substrate.getReplyIdsByPostId(parentId);
      const comments = await subsocial.findPostsWithAllDetails({ ids: replyIds }) || [];
      const replyIdsStr = replyIds.map(x => x.toString())
      const reply = { replyId: replyIdsStr, parentId: parentIdStr }

      if (isSubscribe) {
        setComments(comments)
        useSetReplyToStore(dispatch, { reply, comment: comments })
      }
    }

    if (nonEmptyArr(replyComments)) {
      const replyIds = replyComments.map(x => x.post.struct.id.toString())
      useSetReplyToStore(dispatch, { reply: { replyId: replyIds, parentId: parentIdStr }, comment: replyComments })
    } else {
      loadComments()
        .then(() => isSubscribe && setIsLoading(false))
        .catch(err => log.error('Failed to load comments: %o', err))
    }

    return () => { isSubscribe = false }

  }, [ false ]);

  return isLoading
    ? <MutedDiv className='mt-2 mb-2'><LoadingOutlined className='mr-1' /> Loading replies...</MutedDiv>
    : <ViewCommentsTree space={space} rootPost={rootPost} comments={replyComments} />
}

export const CommentsTree = (props: LoadProps) => {
  const { parent: { id: parentId, replies_count } } = props;

  const count = resolveBn(replies_count)

  if (count.eq(ZERO)) return null;

  const parentIdStr = parentId.toString()

  const comments = useSelector((store: Store) => getComments(store, parentIdStr));

  const Tree = useCallback(() => nonEmptyArr(comments)
  ? <ViewCommentsTree {...props} comments={comments} />
  : <DynamicCommentsTree {...props} />, [ comments.length, parentIdStr, count.toString() ])

  return <Tree />
}
