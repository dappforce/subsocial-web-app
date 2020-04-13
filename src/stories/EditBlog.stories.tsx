import React from 'react';
import { EditForm } from '../components/blogs/EditBlog';
import { mockBlogId, mockBlogStruct, mockBlogJson, mockBlogValidation } from './mocks/BlogMocks';

export default {
  title: 'Blogs | Edit'
}

export const _NewBlog = () =>
  <EditForm {...mockBlogValidation} />

export const _EditBlog = () =>
  <EditForm id={mockBlogId} struct={mockBlogStruct} json={mockBlogJson} {...mockBlogValidation} />
