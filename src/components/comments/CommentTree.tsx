import { PostId, Space } from '@subsocial/types/substrate/interfaces';
import { PostWithAllDetails } from '@subsocial/types';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import React, { useState, useEffect } from 'react'
import { nonEmptyArr, newLogger } from '@subsocial/utils';
import ListData from '../utils/DataList';
import ViewComment from './ViewComment';
import { useSelector, useDispatch } from 'react-redux';
import { getComments, addComments } from 'src/app/slices/commentsSlice';
import { Store } from 'src/app/types';
import { addPost } from 'src/app/slices/postSlice';

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
      const { post: { struct, content }, owner } = item;
      const { id } = struct
      return <ViewComment key={`comment-${id.toString()}`} space={space} struct={struct} content={content} owner={owner} />
    }}
  /> : null;
}

export const CommentsTree = (props: LoadProps) => {
  const { parentId, space, replies } = props;

  const comments = useSelector((store: Store) => getComments(store, parentId.toString()));

  console.log('Comments >>>>>>>>>', comments)

  if (nonEmptyArr(comments)) return <ViewCommentsTree space={space} comments={comments} />

  const [ replyComments, setComments ] = useState<PostWithAllDetails[]>(replies || []);
  const { subsocial, substrate } = useSubsocialApi();
  const dispatch = useDispatch()

  useEffect(() => {

    const loadComments = async () => {
      let comments: PostWithAllDetails[] = []
      if (!replyComments || !replyComments.length) {
        const replyIds = await substrate.getReplyIdsByPostId(parentId);
        comments = await subsocial.findPostsWithSomeDetails(replyIds, { withOwner: true }) as any;
        console.log('UseEffect', comments)
        const replyIdsStr = replyIds.map(x => x.toString())
        dispatch(addComments({ replyId: replyIdsStr, postId: parentId.toString() }))
        console.log('Finish useEffect')
        setComments(comments)
      }
      console.log('Comments in use effect:', comments)
      dispatch(addPost({ posts: comments }))
      console.log('Set posts')
    }

    loadComments().catch(err => log.error('Failed to load comments: %o', err))
  }, [ parentId ]);

  return <ViewCommentsTree space={space} comments={replyComments} />;
}
