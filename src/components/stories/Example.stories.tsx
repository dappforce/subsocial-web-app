
import React, { useState } from 'react';

import { withKnobs } from '@storybook/addon-knobs';
import { Menu, Icon, Button, Avatar } from 'antd';
import ListForumTopics from './ListForumTopics';
import ViewForum from './ViewForum';
import faker from 'faker';

import './style.css';

import substrateLogo from '@polkadot/ui-assets/notext-parity-substrate-white.svg';
import ReorderNavTabs, { Props } from './reorder-navtabs/ReorderNavTabs';
import SpaceNav, { SpaceNavProps } from './space-nav/SpaceNav';
import { PostId, BlogId } from '../types';
import { AccountId } from '@polkadot/types';

const { SubMenu } = Menu;

const items = [ { avatar: faker.image.avatar(), name: faker.company.companyName() },
  { avatar: faker.image.avatar(), name: faker.company.companyName() },
  { avatar: faker.image.avatar(), name: faker.company.companyName() },
  { avatar: faker.image.avatar(), name: faker.company.companyName() },
  { avatar: faker.image.avatar(), name: faker.company.companyName() },
  { avatar: faker.image.avatar(), name: faker.company.companyName() },
  { avatar: faker.image.avatar(), name: faker.company.companyName() } ];

const renderMenu = items.map((d, index) =>
  <Menu.Item key={index}>
    <Avatar style={{ marginRight: '.5rem' }} src={d.avatar} />
    <span>{d.name}</span>
  </Menu.Item>);

class App extends React.Component {
  state = {
    collapsed: false
  };

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  render () {
    return (
      <div style={{ width: 256 }}>
        <Button type='primary' onClick={this.toggleCollapsed} style={{ marginBottom: 16 }}>
          <Icon type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'} />
        </Button>
        <Menu
          defaultSelectedKeys={[ '1' ]}
          defaultOpenKeys={[ 'sub1' ]}
          mode='inline'
          theme='light'
          inlineCollapsed={this.state.collapsed}
        >
          <Menu.Item key='menu1'>
            <Icon type='notification' />
            <span>My Feed</span>
          </Menu.Item>
          <SubMenu
            key='sub1'
            title={
              <span>
                <span>Spaces I follow</span>
              </span>
            }
          >
            {renderMenu}
          </SubMenu>
        </Menu>
      </div>
    );
  }
}

export default {
  title: 'Examples | States',
  decorators: [ withKnobs ]
};

export const DefaultState = () => {
  return <>DefaultState</>;
};

export const AntSidebar = () => <App />;

type MenuItem = {
  name: string,
  route: string,
  image: string
};

const MenuItems: MenuItem[] = [
  {
    name: 'All blogs',
    route: '/all',
    image: 'notification'
  },
  {
    name: 'My blogs',
    route: '/my-blogs',
    image: 'notification'
  },
  {
    name: 'Following blogs',
    route: '/following-blogs',
    image: 'notification'
  },
  {
    name: 'Feed',
    route: '/feed',
    image: 'notification'
  },
  {
    name: 'Notifications',
    route: '/notifications',
    image: 'notification'
  }
];

export const Navigations = () => {
  const [ collapsed, setCollapsed ] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div style={{ width: 256 }}>
      <Button type='primary' onClick={toggleCollapsed} style={{ marginBottom: 16 }}>
        <Icon type={collapsed ? 'menu-unfold' : 'menu-fold'} />
      </Button>
      <Menu
        defaultSelectedKeys={[ '1' ]}
        defaultOpenKeys={[ 'sub1' ]}
        mode='inline'
        theme='light'
        inlineCollapsed={collapsed}
      >
        <Menu.Item style={{ marginRight: '1.5em' }}>
          <Avatar style={{ marginRight: '.5rem' }} src={substrateLogo} />
          <span style={{ fontSize: '1.5rem' }}>Subsocial</span>
        </Menu.Item>
        {MenuItems.map((item, index) => <Menu.Item key={index}>
          <Icon type={item.image} />
          <span>{item.name}</span>
        </Menu.Item>)}
      </Menu>
    </div>
  );
};

export const ListForum = () => {
  return <ListForumTopics data={[]} />
};

export const Forum = () => {
  return <ViewForum />;
}

export const ReorderNavTabsExample = () => {
  const navTabs: Props = {
    tabs: [
      { id: 1, name: 'first name' },
      { id: 2, name: 'second name' },
      { id: 3, name: 'third name' }
    ]
  }
  return <ReorderNavTabs {...navTabs} />
}

export const SpaceNavExample = () => {
  const data: SpaceNavProps = {
    id: 2, // new AccountId('2'),
    followers: [ 3, 4, 5 ], // [ new AccountId('4'), new AccountId('3'), new AccountId('5') ],
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
