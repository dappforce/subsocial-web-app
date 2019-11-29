import React from 'react';
import { List, Icon, Tag } from 'antd';
import './style.css';
import { TopicData } from './types';

type Props = {
  data: TopicData[];
};

function ListForumTopics (props: Props) {

  const { data } = props;

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
                <Tag color={item.category.color}>{item.category.category}</Tag>
                Posted by <b>@{item.description}</b> on {item.time.toDateString()}
              </div>}
          />
          <div className='info'>
            <div>
              <Icon type='message'/>
              {item.commentsCount}
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
