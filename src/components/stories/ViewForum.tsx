import React, { useState } from 'react';
import { Icon, Button, Cascader, Radio } from 'antd';
import './style.css';
import { Category, TopicData } from './types';
import ListForumTopics from './ListForumTopics';
import { RadioChangeEvent } from 'antd/lib/radio';

type ForumProps = {
  categoryList: Category[],
  data: TopicData[]
};

type SortingType = 'score' | 'latest';

function ViewForum (props: ForumProps) {

  const { categoryList, data } = props;
  const [ sortedData, setSortedData ] = useState(data);
  const [ filteredData, setFilteredData ] = useState(sortedData);

  const isDataEmpty = data.length === 0;

  const onChangeFilter = (value: string[]) => {
    let chosenCategory: Category = findCategory(value);
    console.log(chosenCategory);
    filterByCategory(chosenCategory);
  };

  function findCategory (chosenCategory: string[]) {
    let category = chosenCategory.pop();

    let getCurrentCategory = function (categories: Category[]): any {
      if (categories) {
        for (let i = 0; i < categories.length; i++) {
          if (categories[i].title === category) {
            console.log(categories[i]);
            return categories[i];
          }
          let found = getCurrentCategory(categories[i].children);
          if (found) return found;
        }
      }
    };

    let currentCategory = getCurrentCategory(categoryList);
    console.log(currentCategory);
    return currentCategory;
  }

  function findCategoryChildren (chosenCategory: Category) {

    let childrenArray = [ chosenCategory ];

    let getCategoryChildren = function (chosenCategory: Category): any {
      if (chosenCategory.children.length !== 0) {
        return childrenArray.concat(chosenCategory.children);
      }
      for (let i = 0; i < chosenCategory.children.length; i++) {
        return getCategoryChildren(chosenCategory.children[i]);
      }
    };

    let foundChildren = getCategoryChildren(chosenCategory);
    return foundChildren;
  }

  function filterByCategory (currentCategory: Category) {
    let filterCategories: Category[] = [];

    if (currentCategory.children.length !== 0) {
      filterCategories = findCategoryChildren(currentCategory);
    } else {
      filterCategories.push(currentCategory);
    }
    console.log('cat', filterCategories);

    let filterData = sortedData.filter(item => item.categories.filter(category => filterCategories.some(filter => category.title === filter.title)));

    setFilteredData(filterData);
    console.log('filter', filteredData);
  }

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

  const onChangeSorting = (e: RadioChangeEvent) => {
    const sortValue = e.target.value as SortingType;
    console.log(sortValue);
    sortTopicData(sortValue);
  };

  console.log('Here', filteredData);

  return (
    <>
      <div className='ForumHeader'>
        <div className='Navigation'>
          <a href=''><Icon type='home' theme='twoTone'/> / </a>
          <Cascader
            fieldNames={{ label: 'title', value: 'title', children: 'children' }}
            options={categoryList}
            placeholder='Select category'
            onChange={(value) => onChangeFilter(value)}
            changeOnSelect
          />
        </div>
        <div className='Sorting'>
          <div style={{ marginRight: '1.5rem', paddingTop: '.2rem' }}>Sort by:</div>
          <Radio.Group defaultValue='latest' onChange={onChangeSorting}>
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
      <ListForumTopics data={filteredData} isDataEmpty={isDataEmpty} noDataDesc noDataExt={<Button type='primary' icon='plus'>New Topic</Button>}/>
    </>
  );
}

export default ViewForum;
