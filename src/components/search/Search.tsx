import React from 'react';
import { DataSearch } from '@appbaseio/reactivesearch';
import ViewBlog from '../blogs/ViewBlog';
import { ViewPost } from '../posts/ViewPost';
import Router from 'next/router';

const App = () => {
  const getPreviewComponent = (index: string, id: string) => {
    switch (index) {
      case 'subsocial_blogs':
        return <ViewBlog key={id} id={id} miniPreview />;
      case 'subsocial_posts':
        return <ViewPost key={id} id={id} nameOnly withLink={true} />;
      default:
        return <ViewBlog key={id} id={id} miniPreview />;
    }
  };

  return (
    <DataSearch
      componentId='q'
      dataField={['name']}
      placeholder='Search for data'
      queryFormat='and'
      showIcon={false}
      URLParams
      parseSuggestion={(data) => ({
        label: (
          <div>{getPreviewComponent(data.source._index, data.source._id)}</div>
        ),
        value: data.source.name,
        source: data.source._id
      })}
      onValueSelected={(value) => Router.push(`/search?q=${value}`)}
    />
  );
};

export default App;
