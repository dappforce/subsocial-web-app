import React from 'react';
import { Icon, Button, Cascader } from 'antd';
import './style.css';
import { Category, TopicData } from './types';
import ListForumTopics from './ListForumTopics';

type ForumProps = {
  categoryList: Category[],
  data: TopicData[]
};

function ViewForum (props: ForumProps) {

  const { categoryList, data } = props;
  return (
    <>
      <div className='ForumHeader'>
        <div className='Navigation'>
          <a href=''><Icon type='home' theme='twoTone'/> / </a>
          <Cascader
            options={categoryList}
          />
        </div>
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
