
import React from 'react';
import '../utils/styles/subsocial.css';
import { withStorybookContext } from './withStorybookContext';
import { InnerEditPost } from '../posts/EditPost';
import { BlogId, Post, PostId, PostContent } from '../types';

export default {
  title: 'EditPost',
  decorators: [ withStorybookContext ]
};

const mockBlogId = new BlogId(99);

const mockStruct = {
  id: new PostId(10),
  blog_id: mockBlogId
} as unknown as Post

const mockJson: PostContent = {
  title: 'Example post',
  image: '',
  body: 'Description',
  tags: [ '' ]
}

export const NewPost = () =>
  <InnerEditPost blogId={mockBlogId}/>;

export const EditPost = () =>
  <InnerEditPost blogId={mockBlogId} struct={mockStruct} json={mockJson}/>;
