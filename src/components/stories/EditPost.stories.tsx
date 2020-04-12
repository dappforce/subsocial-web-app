
import React from 'react';
import '../utils/styles/subsocial.css';
import { withStorybookContext } from './withStorybookContext';
import { InnerEditPost } from '../posts/EditPost';
import { Post } from '@subsocial/types/substrate/interfaces/subsocial';
import BN from 'bn.js';
import { PostContent } from '@subsocial/types/offchain';

export default {
  title: 'EditPost',
  decorators: [ withStorybookContext ]
};

const mockBlogId = new BN(99);

const mockStruct: Post = {
  id: new BN(10),
  blog_id: mockBlogId
} as any;

const mockJson: PostContent = {
  title: 'Example post',
  image: '',
  body: 'Description',
  canonical: 'http://origina.com',
  tags: [ '' ]
}

export const NewPost = () =>
  <InnerEditPost blogId={mockBlogId}/>;

export const EditPost = () =>
  <InnerEditPost blogId={mockBlogId} struct={mockStruct} json={mockJson}/>;
