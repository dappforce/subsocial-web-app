import React from 'react'
import { InnerEditPost } from '../components/posts/EditPost'
import { mockSpaceId } from './mocks/SpaceMocks'
import { mockPostJson, mockPostStruct, mockPostValidation } from './mocks/PostMocks'

export default {
  title: 'Posts | Edit'
}

export const _NewPost = () =>
  <InnerEditPost {...mockPostValidation} spaceId={mockSpaceId} />

export const _EditPost = () =>
  <InnerEditPost {...mockPostValidation} spaceId={mockSpaceId} struct={mockPostStruct} json={mockPostJson} />
