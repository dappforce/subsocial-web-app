import React, { useState } from 'react';
import { ReactiveList, ReactiveComponent } from '@appbaseio/reactivesearch';
import { ViewBlog } from '../blogs/ViewBlog';
import { ViewPost } from '../posts/ViewPost';
import { Tab, StrictTabProps } from 'semantic-ui-react';
import ViewProfile from '../profiles/ViewProfile';
import { ElasticIndex, ElasticIndexTypes } from '../../config/ElasticConfig';
import Router, { useRouter } from 'next/router';
import ListData from '../utils/DataList';
import Section from '../utils/Section';

type DataResults = {
  _id: string;
  _index: string;
};

const AllTabKey = 'all';

const panes = [
  {
    key: AllTabKey,
    menuItem: 'All'
  },
  {
    key: 'blogs',
    menuItem: 'Blogs'
  },
  {
    key: 'posts',
    menuItem: 'Posts'
  },
  {
    key: 'profiles',
    menuItem: 'Profiles'
  }
];

type Props = {
  results: DataResults[]
};

const resultToPreview = (res: DataResults, i: number) => {
  switch (res._index) {
    case ElasticIndex.blogs:
      return <ViewBlog id={res._id} previewDetails withFollowButton />;
    case ElasticIndex.posts:
      return <ViewPost key={i} id={res._id} preview withLink={true} />;
    case ElasticIndex.profiles:
      return <ViewProfile key={i} id={res._id} preview />;
    default:
      return <></>;
  }
};

const Previews = (props: Props) => {
  const { results } = props;
  return <div className='DfBgColor'>
      <ListData
        dataSource={results}
        renderItem={(res, i) => resultToPreview(res,i)}
        noDataDesc='No results found'
      />
    </div>;
};

type OnTabChangeFn = (event: React.MouseEvent<HTMLDivElement>, data: StrictTabProps) => void;

const Tabs = () => {
  const router = useRouter();

  const getTabIndexFromUrl = (): number => {
    const tabFromUrl = router.query.tab;
    const tabIndex = panes.findIndex(pane => pane.key === tabFromUrl);
    return tabIndex < 0 ? 0 : tabIndex;
  };

  const initialTabIndex = getTabIndexFromUrl();
  const initialTabKey = panes[initialTabIndex].key;
  const [activeTabKey, setActiveTabKey] = useState(initialTabKey);

  const handleTabChange: OnTabChangeFn = (_event, data) => {
    if (!data || !data.panes) return;

    const activeTab = data.panes[data.activeIndex as number];
    const activeKey = (activeTab as unknown as { key: string }).key;

    setActiveTabKey(activeKey);

    router.query.tab = activeKey;
    Router.push({
      pathname: router.pathname,
      query: router.query
    });
  };

  return <>
    <Tab panes={panes} onTabChange={handleTabChange} activeIndex={initialTabIndex}/>
    <ReactiveComponent
      componentId='tab'
      customQuery={() => {
        return activeTabKey === AllTabKey
          ? null
          : {
            query: {
              term: {
                _index: ElasticIndex[activeTabKey as ElasticIndexTypes]
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
        loader={' '}
        render={res => <>
          <Tabs />
          <Previews results={res.data} />
        </>}
        renderNoResults={() => null}
      />
    </Section>
  );
};

export default App;
