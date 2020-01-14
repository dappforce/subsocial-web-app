import React, { useEffect } from 'react';
import { List, Icon, Tag } from 'antd';
import './style.css';
import { TopicData } from './types';
import { DataEmpty } from '../utils/DataList';

type Props = {
  data: TopicData[];
  noDataDesc?: React.ReactNode | string,
  noDataExt?: React.ReactNode,
  isDataEmpty: boolean
};

function ListForumTopics (props: Props) {

  const { data, noDataDesc = 'No topics started yet', noDataExt, isDataEmpty } = props;

  return (
    <>
    {isDataEmpty ? <DataEmpty description={noDataDesc}>{noDataExt}</DataEmpty>
    : <List
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
                  {item.categories.map((category) => <Tag color={category.color}>{category.title}</Tag>)}
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
    }
    </>
  );
}

export default ListForumTopics;
