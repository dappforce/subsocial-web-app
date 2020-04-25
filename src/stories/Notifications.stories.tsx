import React from 'react';
import { Notification } from '../components/activity/Notification';
import { mockProfileDataAlice } from './mocks/SocialProfileMocks';
import { mockAccountAlice } from './mocks/AccountMocks'
import { mockBlogDataAlice } from './mocks/BlogMocks'
import { ViewBlogPage } from '../components/blogs/ViewBlog'

export default {
  title: 'Activity | Notifications'
}

export const _MyNotifications = () =>
  <Notification address={mockAccountAlice.toString()} owner={mockProfileDataAlice} details={new Date().toLocaleString()} textActivity={<>and 1 people use here notification <ViewBlogPage blogData={mockBlogDataAlice} nameOnly withLink /></>}/>
