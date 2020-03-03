
import React from 'react';
import '../utils/styles/subsocial.css';
import { withStorybookContext } from './withStorybookContext';
import { InnerEditPost } from '../posts/EditPost';
import { Post, PostId, PostContent, newBlogId } from '../types';
import { registry } from '@polkadot/react-api';

export default {
  title: 'EditPost',
  decorators: [ withStorybookContext ]
};

const mockBlogId = newBlogId(99);

const mockStruct = {
  id: new PostId(registry, 10),
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
