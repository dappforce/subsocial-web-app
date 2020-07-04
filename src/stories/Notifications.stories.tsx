import React from 'react';
import { Notification } from '../components/activity/Notification';
import { mockProfileDataAlice } from './mocks/SocialProfileMocks';
import { mockAccountAlice } from './mocks/AccountMocks'
import { mockSpaceDataAlice } from './mocks/SpaceMocks'
import { ViewSpacePage } from '../components/spaces/ViewSpace'

export default {
  title: 'Activity | Notifications'
}

export const _MyNotifications = () =>
  <Notification address={mockAccountAlice.toString()} owner={mockProfileDataAlice} details={new Date().toLocaleString()} textActivity={<>and 1 people use here notification <ViewSpacePage spaceData={mockSpaceDataAlice} nameOnly withLink /></>}/>
