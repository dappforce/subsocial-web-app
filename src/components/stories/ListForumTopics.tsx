import React from 'react';
import { List, Icon, Tag } from 'antd';
import faker from 'faker';
import './style.css';

const data = [
  {
    title: faker.company.companyName(),
    description: faker.internet.userName(),
    time: faker.date.recent(),
    comments: faker.random.number(),
    score: faker.random.number(),
    isPinned: true,
    category: 'Project Ideas',
    categoryColor: 'purple'
  },
  {
    title: faker.company.companyName(),
    description: faker.internet.userName(),
    time: faker.date.recent(),
    comments: faker.random.number(),
    score: faker.random.number(),
    isPinned: true,
    category: 'Project Ideas',
    categoryColor: 'purple'
  },
  {
    title: faker.company.companyName(),
    description: faker.internet.userName(),
    time: faker.date.recent(),
    comments: faker.random.number(),
    score: faker.random.number(),
    isPinned: true,
    category: 'Code',
    categoryColor: 'orange'
  },
  {
    title: faker.company.companyName(),
    description: faker.internet.userName(),
    time: faker.date.recent(),
    comments: faker.random.number(),
    score: faker.random.number(),
    isPinned: true,
    category: 'Code',
    categoryColor: 'orange'
  }
];

function ListForumTopics () {
  return (
    <List
      itemLayout='horizontal'
      dataSource={data}
      renderItem={item => (
        <List.Item style={{ backgroundColor: 'white', padding: '1rem' }}>
          <List.Item.Meta
            title={
              <div className='title'>
                {item.isPinned
                  ? <Icon type='pushpin' theme='twoTone'/>
                  : null}
                {item.title}
              </div>}
            description={
              <div className='desc'>
                <Tag color={item.categoryColor}>{item.category}</Tag>
                Posted by <b>@{item.description}</b> on {item.time.toDateString()}
              </div>}
          />
          <div className='info'>
            <div>
              <Icon type='message'/>
              {item.comments}
            </div>
            <div>
              <Icon type='fund'/>
              {item.score}
            </div>
            <Icon type='ellipsis' />
          </div>
        </List.Item>
      )}
    />
  );
}

export default ListForumTopics;
