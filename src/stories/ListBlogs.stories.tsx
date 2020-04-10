import React from 'react';
import { LatestBlogs } from '../components/main/LatestBlogs';
import { mockBlogsData } from './mocks/BlogMocks';

export default {
  title: 'Blogs | List'
}

export const _NoBlogs = () =>
  <LatestBlogs blogsData={[]} />

export const _ListBlogPreviews = () =>
  <LatestBlogs blogsData={mockBlogsData} />
