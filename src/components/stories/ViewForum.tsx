import React, { useState } from 'react';
import { Icon, Button, Cascader, Radio } from 'antd';
import './style.css';
import { Category, TopicData } from './types';
import ListForumTopics from './ListForumTopics';
import { RadioChangeEvent } from 'antd/lib/radio';

const HOME_CATEGORY = 'home';

type ForumProps = {
  categoryList: Category[],
  data: TopicData[]
};

type SortingType = 'score' | 'latest';

function ViewForum (props: ForumProps) {

  const { categoryList, data } = props;
  const [ chosenCategory, setChosenCategory ] = useState(HOME_CATEGORY);
  const [ sortedData, setSortedData ] = useState(data);

  const isHome = chosenCategory === HOME_CATEGORY;
  const isDataEmpty = data.length === 0;
  const filterData = isHome ? sortedData : sortedData.filter(item => item.category.category === chosenCategory);

  function sortByScore (a: TopicData, b: TopicData) {
    if (a.score < b.score) {
      return 1;
    }
    if (a.score > b.score) {
      return -1;
    }
    return 0;
  }

  function sortByDate (a: TopicData, b: TopicData) {
    if (a.time < b.time) {
      return 1;
    }
    if (a.time > b.time) {
      return -1;
    }
    return 0;
  }

  function sortTopicData (chosenSorting: SortingType) {
    switch (chosenSorting) {
      case 'score':
        setSortedData([...sortedData.sort(sortByScore)]);
        console.log(sortedData);
        break;
      case 'latest':
        setSortedData([...data.sort(sortByDate)]);
        console.log(sortedData);
        break;
    }
  }
  console.log('Reload', [ sortedData, filterData]);

  const onChangeSorting = (e: RadioChangeEvent) => {
    const sortValue = e.target.value as SortingType;
    console.log(sortValue);
    sortTopicData(sortValue);
  };

  return (
    <>
      <div className='ForumHeader'>
        <div className='Navigation'>
          <a href=''><Icon type='home' theme='twoTone'/> / </a>
          <Cascader
            fieldNames={{ label: 'category', value: 'category', children: 'children' }}
            options={categoryList}
            placeholder='Select category'
            onChange={(res) => {
              const value = res.pop();
              const category = value ? value : HOME_CATEGORY;
              setChosenCategory(category);
            }}
            changeOnSelect
          />
        </div>
        <div className='Sorting'>
          <div style={{ marginRight: '1.5rem', paddingTop: '.2rem' }}>Sort by:</div>
          <Radio.Group onChange={onChangeSorting}>
            <Radio.Button value='latest'>
              <div>
                <Icon type='clock-circle'/>
                Latest
              </div>
            </Radio.Button>
            <Radio.Button value='score'>
              <div>
                <Icon type='rise'/>
                Score
              </div>
            </Radio.Button>
          </Radio.Group>
        </div>
        <div className='Settings'>
          {!isDataEmpty ? <Button type='primary' icon='plus'>New Topic</Button> : null }
          <Icon type='ellipsis' />
        </div>
      </div>
      <ListForumTopics data={filterData} isDataEmpty={isDataEmpty} noDataDesc noDataExt={<Button type='primary' icon='plus'>New Topic</Button>}/>
    </>
  );
}

export default ViewForum;
