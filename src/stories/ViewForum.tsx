import React from 'react';
import { Icon, Button, Cascader } from 'antd';
import faker from 'faker';
import './style.css';
import ListForumTopics, { TopicData } from './ListForumTopics';

const data: TopicData[] = [
  {
    title: faker.company.companyName(),
    description: faker.internet.userName(),
    time: faker.date.recent(),
    commentsCount: faker.random.number(),
    score: faker.random.number(),
    isPinned: true,
    category: 'Project Ideas',
    categoryColor: 'purple'
  },
  {
    title: faker.company.companyName(),
    description: faker.internet.userName(),
    time: faker.date.recent(),
    commentsCount: faker.random.number(),
    score: faker.random.number(),
    isPinned: true,
    category: 'Project Ideas',
    categoryColor: 'purple'
  },
  {
    title: faker.company.companyName(),
    description: faker.internet.userName(),
    time: faker.date.recent(),
    commentsCount: faker.random.number(),
    score: faker.random.number(),
    isPinned: true,
    category: 'Code',
    categoryColor: 'orange'
  },
  {
    title: faker.company.companyName(),
    description: faker.internet.userName(),
    time: faker.date.recent(),
    commentsCount: faker.random.number(),
    score: faker.random.number(),
    isPinned: true,
    category: 'Code',
    categoryColor: 'orange'
  }
];

const options = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          {
            value: 'xihu',
            label: 'West Lake'
          }
        ]
      }
    ]
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      {
        value: 'nanjing',
        label: 'Nanjing',
        children: [
          {
            value: 'zhonghuamen',
            label: 'Zhong Hua Men'
          }
        ]
      }
    ]
  }
];

function ViewForum () {
  return (
    <>
      <div className='ForumHeader'>
      <a href=''><Icon type='home' theme='twoTone'/> / </a>
        <Cascader
          defaultValue={['zhejiang']}
          options={options}
        />
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
      <ListForumTopics data={data}/>
    </>
  );
}

export default ViewForum;
