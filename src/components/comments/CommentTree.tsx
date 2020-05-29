import { PostId, Space } from '@subsocial/types/substrate/interfaces';
import { PostWithAllDetails } from '@subsocial/types';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import React, { useState, useEffect } from 'react'
import { nonEmptyArr, newLogger } from '@subsocial/utils';
import ListData from '../utils/DataList';
import ViewComment from './ViewComment';

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

      return <ViewComment key={struct.id.toString()} space={space} struct={struct} content={content} owner={owner} />
    }}
  /> : null;
}

export const withLoadedComments = (Component: React.ComponentType<CommentsTreeProps>) => {
  return (props: LoadProps) => {
    const { parentId, space, replies = [] } = props;

    const [ replyComments, setComments ] = useState<PostWithAllDetails[]>(replies);
    const [ isCommentReplies, setIsCommentReplies ] = useState(replyComments.length > 0)
    const { subsocial, substrate } = useSubsocialApi();

    useEffect(() => {
      const loadComments = async () => {
        const replyIds = await substrate.getReplyIdsByPostId(parentId);
        const comments = await subsocial.findPostsWithSomeDetails(replyIds, { withOwner: true }) as any as PostWithAllDetails[];
        setComments(comments)
        setIsCommentReplies(true);
      }

      loadComments().catch(err => log.error('Failed to load comments: %o', err))
    }, [ false ]);

    return isCommentReplies ? <Component space={space} comments={replyComments} /> : null;
  }
}

export const CommentsTree = React.memo(withLoadedComments(ViewCommentsTree));
