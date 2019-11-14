import React from 'react';
import { DataSearch } from '@appbaseio/reactivesearch';
import Router from 'next/router';
import { Icon } from 'antd';
import { ElasticFields } from './ElasticConfig';

const App = () => {
  return (
    <>
      <DataSearch
        componentId='q'
        dataField={[
          ElasticFields.blog.name,
          ElasticFields.blog.desc,
          ElasticFields.post.title,
          ElasticFields.post.body,
          ElasticFields.comment.body,
          ElasticFields.profile.username,
          ElasticFields.profile.fullname,
          ElasticFields.profile.about,
        ]}
        fieldWeights={[2, 1, 2, 1, 2, 2, 1]}
        URLParams
        onValueSelected={(value) => Router.push(`/search?q="${value}"`)}
        placeholder='Search Subsocial'
        iconPosition='right'
        icon={<Icon
          type='search'
          style={{ fontSize: '14px', position: 'relative', top: '-1rem', left: '.5rem' }}
        />}
        className='DfSearch'
        innerClass={{ list: 'visible menu transition' }}
      />
    </>
  );
};

export default App;
