import React from 'react';
import { SpaceNav, SpaceNavProps } from '../components/spaces/SpaceNav';
import { NavigationEditor } from '../components/spaces/NavigationEditor';
import { mockSpaceId, mockSpaceStruct, mockSpaceJson } from './mocks/SpaceMocks';
import { mockAccountAlice } from './mocks/AccountMocks';
import { mockNavTabs } from './mocks/NavTabsMocks';

export default {
  title: 'Spaces | Navigation'
}

const { name, desc, image } = mockSpaceJson

const commonNavProps: SpaceNavProps = {
  spaceId: mockSpaceId,
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
  <NavigationEditor id={mockSpaceId} struct={mockSpaceStruct} json={mockSpaceJson} />
