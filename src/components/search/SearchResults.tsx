import React, { useState } from 'react';
import { ReactiveList, ReactiveComponent } from '@appbaseio/reactivesearch';
import ViewBlog from '../blogs/ViewBlog';
import { ViewPost } from '../posts/ViewPost';
import { Tab, StrictTabProps, Segment } from 'semantic-ui-react';
import ViewProfile from '../profiles/ViewProfile';
import { ElasticIndex } from './ElasticConfig';

type DataResults = {
  _id: string;
  _index: string;
};

const AllIndexes = '*';

type Props = {
  results: DataResults[]
};

const searchResultToPreview = (res: DataResults, i: number) => {
  switch (res._index) {
    case ElasticIndex.blogs:
      return <Segment key={i}><ViewBlog id={res._id} previewDetails withFollowButton /></Segment>;
    case ElasticIndex.posts:
      return <ViewPost key={i} id={res._id} preview withLink={true} />;
    case ElasticIndex.profiles:
      return <ViewProfile key={i} id={res._id} preview />;
    default:
      return null;
  }
};

const Previews = (props: Props) => {
  const { results } = props;
  return !results || !results.length
  ? <em>No results found</em>
  : <div className='DfBackground'>{results.map(searchResultToPreview)}</div>;
};

type OnTabChangeFn = (event: React.MouseEvent<HTMLDivElement>, data: StrictTabProps) => void;

const Tabs = () => {
  const [activeIndex, setActiveIndex] = useState(AllIndexes);

  const handleTabChange: OnTabChangeFn = (e, data) => {
    if (!data || !data.panes) return;

    const activeTab = data.panes[data.activeIndex as number];
    const indexName = (activeTab as unknown as { key: string }).key;
    setActiveIndex(indexName);
  };

  const panes = [
    {
      key: AllIndexes,
      menuItem: 'All'
    },
    {
      key: ElasticIndex.blogs,
      menuItem: 'Blogs'
    },
    {
      key: ElasticIndex.posts,
      menuItem: 'Posts'
    },
    {
      key: ElasticIndex.profiles,
      menuItem: 'Profiles'
    }
  ];

  return <>
    <Tab panes={panes} onTabChange={handleTabChange} defaultActiveIndex={activeIndex} className='DfTab' />
    <ReactiveComponent
      componentId='tab'
      customQuery={() => {
        return activeIndex === AllIndexes
          ? null
          : {
            query: {
              term: {
                _index: activeIndex
              }
            }
          };
      }}
    />
  </>;
};

const App = () => {
  return (
    <ReactiveList
      componentId='page'
      dataField='id'
      react={{ and: ['q', 'tab'] }}
      showResultStats={false}
      URLParams={true}
      size={20}
      pages={100}
      pagination={true}
      render={res => <>
        <Tabs />
        <Previews results={res.data}/>
        </>}
      renderNoResults={() => null}
    />
  );
};

export default App;
