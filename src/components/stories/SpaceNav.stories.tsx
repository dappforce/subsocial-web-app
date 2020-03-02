import React from 'react';
import SpaceNav, { SpaceNavProps } from './space-nav/SpaceNav';
import { PostId, BlogId } from '../types';
import { withStorybookContext } from './withStorybookContext';

export const SpaceNavExample = () => {
  const data: SpaceNavProps = {
    id: 2,
    followers: [ 3, 4, 5 ],
    ProfileContent: {
      fullname: 'test name 1',
      avatar: 'https://i.pinimg.com/736x/50/b6/28/50b628c296e7af456d0c4a89e8feed7d--avatar-image.jpg',
      email: 'test1@gmail.com',
      personal_site: 'https://test.com',
      about: 'about text qweqweqwe qweqwe qwe qweqweqwe qwe qweqwe qweqweqwe qwe qweqweqwe qwe',
      facebook: 'fb.com',
      twitter: 'twitter.com',
      linkedIn: 'linkedin.com',
      github: 'github.com',
      instagram: 'instagram.com'
    },
    navTabs: [
      { id: 1, title: 'first_name', type: 'by-tag', description: '', content: { data: [ 'first', 'value' ] }, hidden: false },
      { id: 2, title: 'second_name', type: 'ext-url', description: '', content: { data: 'http://google.com' }, hidden: true },
      { id: 3, title: 'third_name', type: 'post-url', description: '', content: { data: new PostId('3') }, hidden: false },
      { id: 4, title: 'fourth_name', type: 'blog-url', description: '', content: { data: new BlogId('2') }, hidden: false },
      { id: 5, title: 'fifth_name', type: 'by-tag', description: '', content: { data: [ 'fifth', 'value' ] }, hidden: false }
    ],
    spaces: {
      teamMembers: [
        { id: 1, title: 'First team member', isFollowed: false },
        { id: 2, title: 'Second team member', isFollowed: true },
        { id: 3, title: 'Third team member', isFollowed: false }
      ],
      projects: [
        { id: 1, title: 'First project', isFollowed: false },
        { id: 2, title: 'Second project', isFollowed: true },
        { id: 3, title: 'Third project', isFollowed: false }
      ]
    }
  }
  return <SpaceNav {...data}/>
}

export default {
  title: 'SpaceNavExample',
  decorators: [ withStorybookContext ]
};
