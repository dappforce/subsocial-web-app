import { PostId, Space } from '@subsocial/types/substrate/interfaces';
import { PostWithAllDetails } from '@subsocial/types';
import React, { useState } from 'react'
import { nonEmptyArr, newLogger } from '@subsocial/utils';
import ListData from '../utils/DataList';
import ViewComment from './ViewComment';
import { useSelector, useDispatch } from 'react-redux';
import { getComments } from 'src/redux/slices/replyIdsByPostIdSlice';
import { Store } from 'src/redux/types';
import { useSetReplyToStore } from './utils';
import useSubsocialEffect from '../api/useSubsocialEffect';

const log = newLogger('CommentTree')

type LoadProps = {
  parentId: PostId,
  space: Space,
  replies?: PostWithAllDetails[],
  newCommentId?: PostId
}

type CommentsTreeProps = {
  space: Space,
  comments: PostWithAllDetails[]
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
  const { parentId, space, replies } = props;
  const parentIdStr = parentId.toString()
  const [ replyComments, setComments ] = useState<PostWithAllDetails[]>(replies || []);
  const dispatch = useDispatch()

  useSubsocialEffect(({ subsocial, substrate }) => {

    const loadComments = async () => {
      const replyIds = await substrate.getReplyIdsByPostId(parentId);
      const comments = await subsocial.findVisiblePostsWithAllDetails(replyIds) as any;
      const replyIdsStr = replyIds.map(x => x.toString())
      setComments(comments)
      useSetReplyToStore(dispatch, { reply: { replyId: replyIdsStr, parentId: parentIdStr }, comment: comments })
    }

    if (nonEmptyArr(replyComments)) {
      const replyIds = replyComments.map(x => x.post.struct.id.toString())
      useSetReplyToStore(dispatch, { reply: { replyId: replyIds, parentId: parentIdStr }, comment: replyComments })
    } else {
      loadComments().catch(err => log.error('Failed to load comments: %o', err))
    }

  }, [ dispatch ]);

  return <ViewCommentsTree space={space} comments={replyComments} />;
}

export const CommentsTree = (props: LoadProps) => {
  const { parentId, space } = props;

  const comments = useSelector((store: Store) => getComments(store, parentId.toString()));

  return nonEmptyArr(comments)
    ? <ViewCommentsTree space={space} comments={comments} />
    : <DynamicCommentsTree {...props} />
}
