import React, { useState, useEffect } from 'react';
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
type DataStateType = 'filtered' | 'sorted';

function ViewForum (props: ForumProps) {

  const { categoryList, data } = props;
  const [ chosenSorting, setChosenSorting ] = useState<SortingType>('latest');
  const [ sortedData, setSortedData ] = useState(data);
  const [ filteredData, setFilteredData ] = useState(data);
  const [ isDataProcessed, setIsDataProcessed ] = useState<DataStateType>();

  const isDataEmpty = data.length === 0;

  const onChangeFilter = (value: string[]) => {
    let chosenCategory: Category = findCategory(value);
    console.log(chosenCategory);
    filterByCategory(chosenCategory);
  };

  function findCategory (chosenCategory: string[]) {
    let category = chosenCategory[chosenCategory.length - 1];

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
    let dataToFilter: TopicData[] = isDataProcessed === 'sorted' ? sortedData : data;

    if (currentCategory.children.length !== 0) {
      filterCategories = findCategoryChildren(currentCategory);
    } else {
      filterCategories.push(currentCategory);
    }
    console.log('cat', filterCategories);

    let filterData = dataToFilter.filter(item => item.categories.some(category => filterCategories.some(filter => category.title === filter.title)));

    setFilteredData(filterData);
    if (!isDataProcessed) setIsDataProcessed('filtered');
    console.log('filter', filterData);
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

  useEffect(() => {
    let dataToSort = isDataProcessed === 'filtered' ? filteredData : data;
    console.log(isDataProcessed);

    switch (chosenSorting) {
      case 'score':
        setSortedData([...dataToSort.sort(sortByScore)]);
        if (!isDataProcessed) setIsDataProcessed('sorted');
        console.log(sortedData);
        break;
      case 'latest':
        setSortedData([...dataToSort.sort(sortByDate)]);
        if (!isDataProcessed) setIsDataProcessed('sorted');
        console.log(sortedData);
        break;
    }
  }, [chosenSorting]);

  // function sortTopicData () {
  //   let dataToSort = isDataProcessed === 'filtered' ? filteredData : data;
  //   console.log(isDataProcessed);

  //   switch (chosenSorting) {
  //     case 'score':
  //       setSortedData([...dataToSort.sort(sortByScore)]);
  //       if (!isDataProcessed) setIsDataProcessed('sorted');
  //       console.log(sortedData);
  //       break;
  //     case 'latest':
  //       setSortedData([...dataToSort.sort(sortByDate)]);
  //       if (!isDataProcessed) setIsDataProcessed('sorted');
  //       console.log(sortedData);
  //       break;
  //   }
  // }

  const onChangeSorting = (e: RadioChangeEvent) => {
    const sortValue = e.target.value as SortingType;
    setChosenSorting(sortValue);
    console.log(sortValue);
    // sortTopicData();
  };

  const pinTopics = (data: TopicData[]) => {
    let pinned: TopicData[] = new Array();
    let newData: TopicData[] = new Array();

    for (let i = 0; i < data.length; i++) {
      if (data[i].isPinned === true) {
        pinned.push(data[i]);
      } else {
        newData.unshift(data[i]);
      }
    }
    pinned.push(...newData.reverse());

    return pinned;
  };

  return (
    <>
      <div className='ForumHeader'>
        <div className='Navigation'>
          <a href=''><Icon type='home' theme='twoTone'/> / </a>
          <Cascader
            fieldNames={{ label: 'title', value: 'title', children: 'children' }}
            options={categoryList}
            placeholder='Select category'
            changeOnSelect
            onChange={(value) => onChangeFilter(value)}
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
      <ListForumTopics data={pinTopics(filteredData)} isDataEmpty={isDataEmpty} noDataDesc noDataExt={<Button type='primary' icon='plus'>New Topic</Button>}/>
    </>
  );
}

export default ViewForum;
