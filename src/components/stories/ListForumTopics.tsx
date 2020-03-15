import React from 'react';
import { List, Icon, Tag } from 'antd';
import './style.css';

export type TopicData = {
  title: string;
  description: string;
  time: Date;
  commentsCount: number;
  score: number;
  isPinned: boolean;
  category: string;
  categoryColor: string;
};

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
                <Tag color={item.categoryColor}>{item.category}</Tag>
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
