import React from 'react';
import { ReactiveList } from '@appbaseio/reactivesearch';
import ViewBlog from '../blogs/ViewBlog';
import { ViewPost } from '../posts/ViewPost';
import Section from '../utils/Section';
import { Tab } from 'semantic-ui-react';

type DataResults = {
  _id: string;
  _index: string;
};

enum Categories {
  Blogs = 'subsocial_blogs',
  Posts = 'subsocial_posts'
}

const renderResults = (results: DataResults[]) => {
  const filterResults = (type: Categories) => results.filter(res => res._index === type);

  const renderBlogs = () =>
    filterResults(Categories.Blogs).map((res,index) => <ViewBlog key={index} id={res._id} previewDetails withFollowButton />);

  const renderPosts = () =>
    filterResults(Categories.Posts).map((res,index) => <ViewPost key={index} id={res._id} nameOnly withLink={true} />);

  const panes = [
    { key: 'all', menuItem: 'All', render: () => <Tab.Pane>{[renderBlogs(), renderPosts()]}</Tab.Pane> },
    { key: 'blogs', menuItem: 'Blogs', render: () => <Tab.Pane>{renderBlogs()}</Tab.Pane> },
    { key: 'posts', menuItem: 'Posts', render: () => <Tab.Pane>{renderPosts()}</Tab.Pane> }
  ];

  return <Tab panes={panes} />;
};

const App = () => {
  return (
    <Section>
      <ReactiveList
        componentId='results'
        dataField='name'
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
