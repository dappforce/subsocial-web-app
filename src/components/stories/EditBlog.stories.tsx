import React from 'react';
import '../utils/styles/subsocial.css';
import { withStorybookContext } from './withStorybookContext';
import { EditForm } from '../blogs/EditBlog';
import { BlogId, Blog, BlogContent } from '../types';
import { U32 } from '@polkadot/types';

export default {
  title: 'EditBlog',
  decorators: [ withStorybookContext ]
};

const mockBlogId = new BlogId(99);

const mockStruct = {
  id: mockBlogId,
  handle: 'Test_handle'
} as unknown as Blog

const mockJson: BlogContent = {
  name: 'Test name',
  desc: 'Test description',
  image: 'https://media.makeameme.org/created/cat-ni-nigga.jpg',
  tags: [ 'tag1', 'tag2', 'tag3' ]
}

const validations = {
  blogMaxLen: new U32(500),
  handleMinLen: new U32(5),
  handleMaxLen: new U32(50)
}

export const NewBlog = () =>
  <EditForm {...validations} />

export const EditBlog = () =>
  <EditForm id={mockBlogId} struct={mockStruct} json={mockJson} {...validations} />
