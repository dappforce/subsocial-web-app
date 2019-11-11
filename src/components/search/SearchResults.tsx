import React from 'react';
import { ReactiveList } from '@appbaseio/reactivesearch';
import ViewBlog from '../blogs/ViewBlog';
import { ViewPost } from '../posts/ViewPost';
import Section from '../utils/Section';
import { Tab } from 'semantic-ui-react';
import ViewProfile from '../profiles/ViewProfile';
import { ElasticIndex } from './ElasticConfig';

type DataResults = {
  _id: string;
  _index: string;
};

const renderResults = (results: DataResults[]) => {
  const filterResults = (indexName: string) => results.filter(res => res._index === indexName);

  const renderBlogs = () =>
    filterResults(ElasticIndex.blogs).map((res, i) => <ViewBlog key={i} id={res._id} previewDetails withFollowButton />);

  const renderPosts = () =>
    filterResults(ElasticIndex.posts).map((res, i) => <ViewPost key={i} id={res._id} preview withLink={true} />);

  const renderProfiles = () =>
    filterResults(ElasticIndex.profiles).map((res, i) => <ViewProfile key={i} id={res._id} preview />);


  const panes = [
    { key: 'all', menuItem: 'All', render: () => <Tab.Pane>{[renderBlogs(), renderPosts(), renderProfiles()]}</Tab.Pane> },
    { key: 'blogs', menuItem: 'Blogs', render: () => <Tab.Pane>{renderBlogs()}</Tab.Pane> },
    { key: 'posts', menuItem: 'Posts', render: () => <Tab.Pane>{renderPosts()}</Tab.Pane> },
    { key: 'profiles', menuItem: 'Profiles', render: () => <Tab.Pane>{renderProfiles()}</Tab.Pane> }
  ];

  return <Tab panes={panes} />;
};

const App = () => {
  return (
    <Section>
      <ReactiveList
        componentId='page'
        dataField='id'
        react={{
          and: ['q']
        }}
        showResultStats={false}
        URLParams={true}
        size={10}
        pages={3}
        pagination={true}
        render={res => renderResults(res.data)}
      />
    </Section>
  );
};

export default App;
