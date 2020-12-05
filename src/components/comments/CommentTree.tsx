import { PostWithSomeDetails } from 'src/types'
import React, { FC } from 'react'
import { nonEmptyArr } from '@subsocial/utils'
import ViewComment from './ViewComment'
import DataList from '../lists/DataList'
import { PostStruct, SpaceStruct } from 'src/types'

type CommentsTreeProps = {
  rootPost?: PostStruct,
  space: SpaceStruct,
  comments: PostWithSomeDetails[]
}

export const ViewCommentsTree: FC<CommentsTreeProps> = ({ comments, rootPost, space }) => {
  return nonEmptyArr(comments) ? <DataList
    dataSource={comments}
    renderItem={(item) => {
      const { post: { struct } } = item
      return <ViewComment key={struct.id} space={space} rootPost={rootPost} comment={item} withShowReplies />
    }}
  /> : null
}
