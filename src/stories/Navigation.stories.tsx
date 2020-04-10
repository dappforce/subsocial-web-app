import React from 'react';
import { SpaceNav, SpaceNavProps } from '../components/blogs/SpaceNav';
import { NavigationEditor } from '../components/blogs/NavigationEditor';
import { mockBlogId, mockBlogStruct, mockBlogJson } from './mocks/BlogMocks';
import { mockAccountAlice } from './mocks/AccountMocks';
import { mockNavTabs } from './mocks/NavTabsMocks';

export default {
  title: 'Blogs | Navigation'
}

const { name, desc, image } = mockBlogJson

const commonNavProps: SpaceNavProps = {
  blogId: mockBlogId,
  creator: mockAccountAlice,
  name: name,
  desc: desc,
  image: image,
  followingCount: 123,
  followersCount: 45678
}

export const _EmptyNavigation = () =>
  <SpaceNav {...commonNavProps} />

export const _NavigationWithTabs = () =>
  <SpaceNav {...commonNavProps} navTabs={mockNavTabs} />

export const _EditNavigation = () =>
  <NavigationEditor id={mockBlogId} struct={mockBlogStruct} json={mockBlogJson} />
