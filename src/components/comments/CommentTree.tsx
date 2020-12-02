import { PostWithSomeDetails } from 'src/types'
import React, { useState, useCallback, FC } from 'react'
import { nonEmptyArr, newLogger } from '@subsocial/utils'
import ViewComment from './ViewComment'
import { useSelector, useDispatch } from 'react-redux'
import { getComments } from 'src/redux/slices/replyIdsByPostIdSlice'
import { Store } from 'src/redux/types'
import { useSetReplyToStore } from './utils'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { LoadingOutlined } from '@ant-design/icons'
import { MutedDiv } from '../utils/MutedText'
import { isFakeId } from './helpers'
import DataList from '../lists/DataList'
import { PostStruct, SpaceStruct } from 'src/types'
import { idToPostId } from 'src/types/utils'

const log = newLogger('CommentTree')

type LoadProps = {
  rootPost?: PostStruct,
  parent: PostStruct,
  space: SpaceStruct,
  replies?: PostWithSomeDetails[]
}

type CommentsTreeProps = {
  rootPost?: PostStruct,
  space: SpaceStruct,
  comments: PostWithSomeDetails[]
}

const ViewCommentsTree: FC<CommentsTreeProps> = ({ comments, rootPost, space }) => {
  return nonEmptyArr(comments) ? <DataList
    dataSource={comments}
    renderItem={(item) => {
      const { post: { struct } } = item
      return <ViewComment key={struct.id} space={space} rootPost={rootPost} comment={item} withShowReplies />
    }}
  /> : null
}

export const DynamicCommentsTree = (props: LoadProps) => {
  const { rootPost, parent: { id: parentId }, space, replies } = props

  if (isFakeId(props.parent)) return null

  const dispatch = useDispatch()

  const [ isLoading, setIsLoading ] = useState(true)
  const [ replyComments, setComments ] = useState(replies || [])

  const hasComments = nonEmptyArr(replyComments)

  useSubsocialEffect(({ flatApi, substrate }) => {
    if (!isLoading) return

    let isSubscribe = true

    const loadComments = async () => {

      // TODO use redux
      const replyIds = await substrate.getReplyIdsByPostId(idToPostId(parentId))
      const comments = await flatApi.findPostsWithAllDetails({ ids: replyIds }) || []

      const replyIdsStr = replyIds.map(x => x.toString())
      const reply = { replyId: replyIdsStr, parentId }

      if (isSubscribe) {
        setComments(comments)
        useSetReplyToStore(dispatch, { reply, comment: comments })
      }
    }

    if (hasComments) {
      const replyIds = replyComments.map(x => x.post.struct.id.toString())
      const reply = { replyId: replyIds, parentId }
      useSetReplyToStore(dispatch, { reply, comment: replyComments })
    } else {
      loadComments()
        .then(() => isSubscribe && setIsLoading(false))
        .catch(err => log.error('Failed to load comments:', err))
    }

    return () => { isSubscribe = false }

  }, [])

  return isLoading && !hasComments
    ? <MutedDiv className='mt-2 mb-2'><LoadingOutlined className='mr-1' /> Loading replies...</MutedDiv>
    : <ViewCommentsTree space={space} rootPost={rootPost} comments={replyComments} />
}

export const CommentsTree = (props: LoadProps) => {
  const { parent: { id: parentId, repliesCount } } = props
  const comments = useSelector((store: Store) => getComments(store, parentId))
  const hasComments = nonEmptyArr(comments)

  const Tree = useCallback(() =>
    nonEmptyArr(comments)
      ? <ViewCommentsTree {...props} comments={comments} />
      : <DynamicCommentsTree {...props} />,
    [ parentId, comments.length, repliesCount ]
  )

  if (!repliesCount && !hasComments) return null

  return <Tree />
}
