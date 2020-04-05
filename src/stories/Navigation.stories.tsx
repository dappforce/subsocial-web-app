import React from 'react';
import '../components/utils/styles/subsocial.css';
import { withStorybookContext } from './withStorybookContext';
import { NavigationEditor } from '../components/blogs/NavigationEditor';
import { mockBlogId, mockBlogStruct, mockBlogJson } from './mocks/BlogMocks';

export default {
  title: 'Blogs | Navigation',
  decorators: [ withStorybookContext ]
}

export const _EditNavigation = () =>
  <NavigationEditor id={mockBlogId} struct={mockBlogStruct} json={mockBlogJson} />
