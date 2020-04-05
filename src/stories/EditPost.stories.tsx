import React from 'react';
import { withStorybookContext } from './withStorybookContext';
import { InnerEditPost } from '../components/posts/EditPost';
import { mockBlogId } from './mocks/BlogMocks';
import { mockPostJson, mockPostStruct, mockPostValidation } from './mocks/PostMocks';

export default {
  title: 'Posts | Edit',
  decorators: [ withStorybookContext ]
}

export const _NewPost = () =>
  <InnerEditPost {...mockPostValidation} blogId={mockBlogId} />

export const _EditPost = () =>
  <InnerEditPost {...mockPostValidation} blogId={mockBlogId} struct={mockPostStruct} json={mockPostJson} />
