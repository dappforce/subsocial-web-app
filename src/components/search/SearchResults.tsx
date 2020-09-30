import React, { useState } from 'react';
import { ReactiveList, ReactiveComponent } from '@appbaseio/reactivesearch';
import { DynamicViewSpace } from '../spaces/ViewSpace';
import { Segment } from 'src/components/utils/Segment';
import { Tabs } from 'antd'
import { ElasticIndex, ElasticIndexTypes } from '../../config/ElasticConfig';
import { useRouter } from 'next/router';
import PaginatedList from 'src/components/lists/PaginatedList';
import Section from '../utils/Section';
import { GenericAccountId as AccountId } from '@polkadot/types';
import { hexToBn } from '@polkadot/util';
import { registry } from '@subsocial/types/substrate/registry';
import { ProfilePreviewWithOwner } from '../profiles/address-views';
import { DynamicPostPreview } from '../posts/view-post/DynamicPostPreview';

const { TabPane } = Tabs

type DataResults = {
  _id: string;
  _index: string;
};

const AllTabKey = 'all';

const panes = [
  {
    key: AllTabKey,
    title: 'All'
  },
  {
    key: 'spaces',
    title: 'Spaces'
  },
  {
    key: 'posts',
    title: 'Posts'
  },
  {
    key: 'profiles',
    title: 'Profiles'
  }
];

type Props = {
  results: DataResults[]
};

const resultToPreview = (res: DataResults, i: number) => {
  switch (res._index) {
    case ElasticIndex.spaces:
      return <DynamicViewSpace id={hexToBn(res._id)} preview withFollowButton />;
    case ElasticIndex.posts:
      return <DynamicPostPreview key={i} id={hexToBn(res._id)} withActions />;
    case ElasticIndex.profiles:
      return <Segment>
        <ProfilePreviewWithOwner
          key={res._id}
          address={new AccountId(registry, res._id)}
        />
      </Segment>;
    default:
      return <></>;
  }
};

const Previews = (props: Props) => {
  const { results } = props;
  return <div className='DfBgColor'>
    <PaginatedList
      dataSource={results}
      renderItem={(res, i) => resultToPreview(res, i)}
      noDataDesc='No results found'
    />
  </div>;
};

type OnTabChangeFn = (key: string) => void;

const ResultsTabs = () => {
  const router = useRouter();

  const getTabIndexFromUrl = (): number => {
    const tabFromUrl = router.query.tab;
    const tabIndex = panes.findIndex(pane => pane.key === tabFromUrl);
    return tabIndex < 0 ? 0 : tabIndex;
  };

  const initialTabIndex = getTabIndexFromUrl();
  const initialTabKey = panes[initialTabIndex].key;
  const { tags, spaceId } = router.query;

  const [ activeTabKey, setActiveTabKey ] = useState(initialTabKey);

  const handleTabChange: OnTabChangeFn = (key) => {
    setActiveTabKey(key);

    router.query.tab = key;

    const newPath = {
      pathname: router.pathname,
      query: router.query
    }

    router.push(newPath, newPath);
  };

  return <>
    <Tabs onChange={handleTabChange} activeKey={activeTabKey.toString()}>
      {panes.map(({ key, title }) => <TabPane key={key} tab={title} />)}
    </Tabs>
    <ReactiveComponent
      componentId='spaceId'
      customQuery={() => {
        return spaceId === undefined
          ? null
          : {
            query: {
              term: {
                space_id: spaceId
              }
            }
          };
      }}
    />

    <ReactiveComponent
      componentId='tags'
      customQuery={() => {
        return tags === undefined
          ? null
          : {
            query: {
              terms: {
                tags: (tags as string).split(',')
              }
            }
          };
      }}
    />

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
        react={{ and: [ 'q', 'tab', 'tags', 'spaceId' ] }}
        showResultStats={false}
        URLParams={true}
        loader={' '}
        render={res => <>
          <ResultsTabs />
          <Previews results={res.data} />
        </>}
        renderNoResults={() => null}
      />
    </Section>
  );
};

export default App;
