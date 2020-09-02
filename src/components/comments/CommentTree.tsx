import { Post, Space } from '@subsocial/types/substrate/interfaces';
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
import { LoadingOutlined } from '@ant-design/icons';
import { MutedDiv } from '../utils/MutedText';
import { isFakeId } from './helpers';

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
  return nonEmptyArr(comments) ? <ListData
    dataSource={comments}
    paginationOff
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

  const [ isLoading, setIsLoading ] = useState(parentIdStr.startsWith('fake'))
  const [ replyComments, setComments ] = useState<PostWithSomeDetails[]>(replies || []);
  const dispatch = useDispatch()

  useSubsocialEffect(({ subsocial, substrate }) => {

    const loadComments = async () => {
      setIsLoading(true)
      const replyIds = await substrate.getReplyIdsByPostId(parentId);
      const comments = await subsocial.findPostsWithAllDetails({ ids: replyIds }) as any;
      const replyIdsStr = replyIds.map(x => x.toString())
      setComments(comments)
      const reply = { replyId: replyIdsStr, parentId: parentIdStr }
      useSetReplyToStore(dispatch, { reply, comment: comments })
      setIsLoading(false)
    }

    if (nonEmptyArr(replyComments)) {
      const replyIds = replyComments.map(x => x.post.struct.id.toString())
      useSetReplyToStore(dispatch, { reply: { replyId: replyIds, parentId: parentIdStr }, comment: replyComments })
    } else {
      loadComments().catch(err => log.error('Failed to load comments: %o', err))
    }

  }, [ dispatch ]);

  return isLoading
    ? <MutedDiv className='mt-2 mb-2'><LoadingOutlined className='mr-1' /> Loading replies...</MutedDiv>
    : <ViewCommentsTree space={space} rootPost={rootPost} comments={replyComments} />
}

export const CommentsTree = (props: LoadProps) => {
  const { parent: { id: parentId } } = props;

  const comments = useSelector((store: Store) => getComments(store, parentId.toString()));

  return nonEmptyArr(comments)
    ? <ViewCommentsTree {...props} comments={comments} />
    : <DynamicCommentsTree {...props} />
}
