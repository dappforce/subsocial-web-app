
import React from 'react';
import '../utils/styles/subsocial.css';
import { withStorybookContext } from './withStorybookContext';
import { InnerEditPost } from '../posts/PostEditor/EditPost';
import { BlogId, Post, PostId, BlockValue } from '../types';

export default {
  title: 'EditPost',
  decorators: [ withStorybookContext ]
};

const mockBlogId = new BlogId(99);

const mockStruct = {
  id: new PostId(10),
  blog_id: mockBlogId
} as unknown as Post

const mappedBlocks: BlockValue[] = [

]

const mockJson = {
  title: 'Example post',
  image: '',
  blocks: [],
  tags: [ '' ],
  canonical: ''
}

export const NewPost = () =>
  <InnerEditPost blogId={mockBlogId} mappedBlocks={mappedBlocks} />

export const EditPost = () =>
  <InnerEditPost blogId={mockBlogId} struct={mockStruct} json={mockJson} mappedBlocks={mappedBlocks} />
