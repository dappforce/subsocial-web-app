import React, { useState } from 'react';
import { Icon, Button, Cascader } from 'antd';
import './style.css';
import { Category, TopicData } from './types';
import ListForumTopics from './ListForumTopics';
import RadioButton from 'antd/lib/radio/radioButton';

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
            fieldNames={{ label: 'category', value: 'category', children: 'children' }}
            options={categoryList}
          />
        </div>
        <div className='Sorting'>
          <div style={{ marginRight: '1.5rem', paddingTop: '.2rem' }}>Sort by:</div>
          <Button className='Latest Button' type='link'>
            <Icon type='clock-circle'/>
            <div>Latest</div>
          </Button>
          <Button className='Score Button' type='link'>
            <Icon type='rise'/>
            <div>Score</div>
          </Button>
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
