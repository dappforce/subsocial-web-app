import { PostId } from 'src/types'
import React, { FC, useState } from 'react'
import { isEmptyArray, nonEmptyArr } from '@subsocial/utils'
import ViewComment from './ViewComment'
import DataList from '../lists/DataList'
import { PostStruct, SpaceStruct } from 'src/types'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'
import { fetchPosts, selectPost, selectPosts } from 'src/rtk/features/posts/postsSlice'
import { fetchPostReplyIds, selectReplyIds } from 'src/rtk/features/replies/repliesSlice'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { Loading } from '../utils'
import { useMyAddress } from '../auth/MyAccountContext'

type CommentsTreeProps = {
  space: SpaceStruct,
  rootPost?: PostStruct,
  parentId: PostId,
}

export const ViewCommentsTree: FC<CommentsTreeProps> = ({ space, rootPost, parentId }) => {
  const dispatch = useAppDispatch()
  const myAddress = useMyAddress()
  const comment = useAppSelector(state => selectPost(state, { id: parentId }), shallowEqual)
  const { repliesCount = 0 } = comment?.post.struct || {}
  const { replyIds = []} = useAppSelector(state => selectReplyIds(state, parentId), shallowEqual) || {}

  const postsArgs = { ids: replyIds, withSpace: false }
  const comments = useAppSelector(state => selectPosts(state, postsArgs), shallowEqual)
  const [ loading, setLoading ] = useState(false)

  useSubsocialEffect(({ subsocial }) => {
    if (!repliesCount || nonEmptyArr(replyIds)) return

    let isMounted = true
    setLoading(true)

    dispatch(fetchPostReplyIds({ api: subsocial, ids: [ parentId ]}))
      .then(() => isMounted && setLoading(false))

    return () => { isMounted = false }
  }, [ parentId, repliesCount ])

  useSubsocialEffect(({ subsocial }) => {
    if (isEmptyArray(replyIds) || nonEmptyArr(comments)) return

    let isMounted = true
    setLoading(true)

    dispatch(fetchPosts({ api: subsocial, myAddress, ...postsArgs }))
      .then(() => isMounted && setLoading(false))

    return () => { isMounted = false }
  }, [ parentId, replyIds.length ])


  // console.log('ViewCommentsTree', { parentId, repliesCount, replyIds })

  if (!comment) return null

  if (loading) return <Loading label='Loading replies...' center={false} />

  if (isEmptyArray(comments)) return null

  return (
    <DataList
      dataSource={comments}
      getKey={comment => comment.id}
      renderItem={comment => <ViewComment space={space} rootPost={rootPost} comment={comment} />}
    />
  )
}
