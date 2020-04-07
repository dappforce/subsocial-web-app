import React from 'react';
import { withStorybookContext } from './withStorybookContext';
import { EditForm } from '../components/blogs/EditBlog';
import { mockBlogId, mockBlogStruct, mockBlogJson, mockBlogValidation } from './mocks/BlogMocks';

export default {
  title: 'Blogs | Edit',
  decorators: [ withStorybookContext ]
}

export const _NewBlog = () =>
  <EditForm {...mockBlogValidation} />

export const _EditBlog = () =>
  <EditForm id={mockBlogId} struct={mockBlogStruct} json={mockBlogJson} {...mockBlogValidation} />
