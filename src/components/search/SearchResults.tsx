import React, { useState } from 'react';
import { ReactiveList, ReactiveComponent } from '@appbaseio/reactivesearch';
import ViewBlog from '../blogs/ViewBlog';
import { ViewPost } from '../posts/ViewPost';
import Section from '../utils/Section';
import { Tab, StrictTabProps } from 'semantic-ui-react';
import ViewProfile from '../profiles/ViewProfile';
import { ElasticIndex } from './ElasticConfig';

type DataResults = {
  _id: string;
  _index: string;
};

const AllIndexes = '*';

type Props = {
  results: DataResults[]
}

type OnTabChangeFn = (event: React.MouseEvent<HTMLDivElement>, data: StrictTabProps) => void;

const TabsAndResults = (props: Props) => {
  const { results } = props;
  const [activeIndex, setActiveIndex] = useState(AllIndexes);

  const handleTabChange: OnTabChangeFn = (e, data) => {
    if (!data || !data.panes) return;

    const activeTab = data.panes[data.activeIndex as number];
    const indexName = (activeTab as unknown as { key: string }).key;
    setActiveIndex(indexName)
  }

  const Previews = () => !results || !results.length
    ? <em>No results found</em>
    : <div>{results.map((res, i) => {
      switch (res._index) {
        case ElasticIndex.blogs:
          return <ViewBlog key={i} id={res._id} previewDetails withFollowButton />;
        case ElasticIndex.posts:
          return <ViewPost key={i} id={res._id} preview withLink={true} />;
        case ElasticIndex.profiles:
          return <ViewProfile key={i} id={res._id} preview />;
        default:
          return null;
      }
    })}</div>

  const TabContent = () =>
    <Tab.Pane><Previews /></Tab.Pane>

  const panes = [
    {
      key: AllIndexes,
      menuItem: 'All',
      render: () => <TabContent />
    },
    {
      key: ElasticIndex.blogs,
      menuItem: 'Blogs',
      render: () => <TabContent />
    },
    {
      key: ElasticIndex.posts,
      menuItem: 'Posts',
      render: () => <TabContent />
    },
    {
      key: ElasticIndex.profiles,
      menuItem: 'Profiles',
      render: () => <TabContent />
    }
  ];

  return <>
    <Tab panes={panes} onTabChange={handleTabChange} />
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
    <Section>
      <ReactiveList
        componentId='page'
        dataField='id'
        react={{ and: ['q', 'tab'] }}
        showResultStats={false}
        URLParams={true}
        size={20}
        pages={100}
        pagination={true}
        render={res => <TabsAndResults results={res.data} />}
        renderNoResults={() => null}
      />
    </Section>
  );
};

export default App;
