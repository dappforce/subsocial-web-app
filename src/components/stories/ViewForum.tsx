import React from 'react';
import { Icon, Button, Cascader, Radio } from 'antd';
import './style.css';
import { Category, TopicData } from './types';
import ListForumTopics from './ListForumTopics';
import { CascaderOptionType } from 'antd/lib/cascader';

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
          <Radio.Group>
            <Radio.Button value='large'>
              <div>
                <Icon type='clock-circle'/>
                Latest
              </div>
            </Radio.Button>
            <Radio.Button value='large'>
              <div>
                <Icon type='rise'/>
                Score
              </div>
            </Radio.Button>
          </Radio.Group>
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
