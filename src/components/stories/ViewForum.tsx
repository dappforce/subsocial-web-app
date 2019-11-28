import React from 'react';
import { List, Icon, Tag, Menu, Breadcrumb, Button } from 'antd';
import faker from 'faker';
import './style.css';
import ListForumTopics from './ListForumTopics';

const menu = (
  <Menu>
    <Menu.Item>
      <a target='_blank' rel='noopener noreferrer' href='http://www.alipay.com/'>
        General
      </a>
    </Menu.Item>
    <Menu.Item>
      <a target='_blank' rel='noopener noreferrer' href='http://www.taobao.com/'>
        Layout
      </a>
    </Menu.Item>
    <Menu.Item>
      <a target='_blank' rel='noopener noreferrer' href='http://www.tmall.com/'>
        Navigation
      </a>
    </Menu.Item>
  </Menu>
);

function ViewForum () {
  return (
    <>
      <div className='ForumHeader'>
        <Breadcrumb>
          <Breadcrumb.Item>
            <a href=''><Icon type='home' theme='twoTone'/></a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <a href=''>Startups</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <a href=''>Project ideas</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item overlay={menu}>
            <a href=''>Code</a>
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className='Sorting'>
          <div style={{ marginRight: '1.5rem' }}>Sort by:</div>
          <div className='Latest Button'>
            <Icon type='clock-circle'/>
            <div>Latest</div>
          </div>
          <div className='Score Button'>
            <Icon type='clock-circle'/>
            <div>Score</div>
          </div>
        </div>
        <div className='Settings'>
          <Button type='primary' icon='plus'>New Topic</Button>
          <Icon type='ellipsis' />
        </div>
      </div>
      <ListForumTopics/>
    </>
  );
}

export default ViewForum;