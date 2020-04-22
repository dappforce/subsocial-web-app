import React from 'react';
import { LatestBlogs } from '../components/main/LatestBlogs';
import { mockBlogDataAlice, mockBlogDataBob } from './mocks/BlogMocks';

export default {
  title: 'Blogs | List'
}

export const _NoBlogPreviews = () =>
  <LatestBlogs blogsData={[]} />

export const _ListOneBlogPreview = () =>
  <LatestBlogs blogsData={[ mockBlogDataAlice ]} />

export const _ListManyBlogPreviews = () =>
  <LatestBlogs blogsData={[ mockBlogDataAlice, mockBlogDataBob, mockBlogDataAlice ]} />
