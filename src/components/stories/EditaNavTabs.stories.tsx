import React from 'react';
import '../utils/styles/subsocial.css';
import { withStorybookContext } from './withStorybookContext';
import { NavigationEditor } from '../blogs/NavigationEditor';
import { BlogId, Blog, BlogContent } from '../types';

export default {
  title: 'EditNavigation',
  decorators: [ withStorybookContext ]
};

const mockBlogId = new BlogId(99);

const mockStruct = {
  id: mockBlogId,
  slug: 'Test_slug'
} as unknown as Blog

const mockJson: BlogContent = {
  name: 'Test name',
  desc: 'Test description',
  image: 'https://media.makeameme.org/created/cat-ni-nigga.jpg',
  tags: [ 'tag1', 'tag2', 'tag3' ],
  navTabs: [
    { id: 1, title: 'first_name', type: 'by-tag', description: '', content: { data: [ 'first', 'value' ] }, hidden: false },
    { id: 2, title: 'second_name', type: 'url', description: '', content: { data: 'http://google.com' }, hidden: true },
    { id: 3, title: 'third_name', type: 'url', description: '', content: { data: '3' }, hidden: false },
    { id: 4, title: 'fourth_name', type: 'url', description: '', content: { data: '2' }, hidden: false },
    { id: 5, title: 'fifth_name', type: 'by-tag', description: '', content: { data: [ 'fifth', 'value' ] }, hidden: false }
  ]
}

export const EditNavigation = () =>
  <NavigationEditor id={mockBlogId} struct={mockStruct} json={mockJson} />
