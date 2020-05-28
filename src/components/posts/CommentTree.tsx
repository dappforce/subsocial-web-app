import { PostId, Blog } from '@subsocial/types/substrate/interfaces';
import { ExtendedPostData } from '@subsocial/types';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import React, { useState, useEffect } from 'react'
import { nonEmptyArr, newLogger } from '@subsocial/utils';
import ListData from '../utils/DataList';
import ViewComment from './ViewComment';

const log = newLogger('CommentTree')

type LoadProps = {
  parentId: PostId,
  blog: Blog,
  replies?: ExtendedPostData[],
  newCommentId?: PostId
}

type CommentsTreeProps = {
  blog: Blog,
  comments: ExtendedPostData[]
}

const ViewCommentsTree: React.FunctionComponent<CommentsTreeProps> = ({ comments, blog }) => {
  return nonEmptyArr(comments) ? <ListData
    dataSource={comments}
    paginationOff
    renderItem={(item) => {
      const { post: { struct, content }, owner } = item;

      return <ViewComment key={struct.id.toString()} blog={blog} struct={struct} content={content} owner={owner} />
    }}
  /> : null;
}

export const withLoadedComments = (Component: React.ComponentType<CommentsTreeProps>) => {
  return (props: LoadProps) => {
    const { parentId, blog, replies = [] } = props;

    const [ replyComments, setComments ] = useState<ExtendedPostData[]>(replies);
    const [ isCommentReplies, setIsCommentReplies ] = useState(replyComments.length > 0)
    const { subsocial, substrate } = useSubsocialApi();

    useEffect(() => {
      const loadComments = async () => {
        const replyIds = await substrate.getReplyIdsByPostId(parentId);
        const comments = await subsocial.findPostsWithAllDetails(replyIds);
        setComments(comments)
        setIsCommentReplies(true);
      }

      loadComments().catch(err => log.error('Failed to load comments: %o', err))
    }, [ false ]);

    return isCommentReplies ? <Component blog={blog} comments={replyComments} /> : null;
  }
}

export const CommentsTree = React.memo(withLoadedComments(ViewCommentsTree));
