import React from 'react';
import { List, Icon } from 'antd';
import faker from 'faker';
import './style.css';

const data = [
  {
    title: faker.company.companyName(),
    description: faker.internet.userName(),
    time: faker.date.recent(),
    comments: faker.random.number(),
    score: faker.random.number()
  },
  {
    title: faker.company.companyName(),
    description: faker.internet.userName(),
    time: faker.date.recent(),
    comments: faker.random.number(),
    score: faker.random.number()
  },
  {
    title: faker.company.companyName(),
    description: faker.internet.userName(),
    time: faker.date.recent(),
    comments: faker.random.number(),
    score: faker.random.number()
  },
  {
    title: faker.company.companyName(),
    description: faker.internet.userName(),
    time: faker.date.recent(),
    comments: faker.random.number(),
    score: faker.random.number()
  }
];

function ListForumTopics () {
  return (
    <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={<a><b>{item.title}</b></a>}
              description={<div>Posted by @{item.description} on {item.time.toDateString()}</div>}
            />
            <div className='info'>
              <div>
                <Icon type='message'></Icon>
                {item.comments}
              </div>
              <div>
                <Icon type='fund'></Icon>
                {item.score}
              </div>
              <Icon type="ellipsis" />
            </div>
          </List.Item>
        )}
    />
  );
}

export default ListForumTopics;
