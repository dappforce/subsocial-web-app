import React from 'react';
import { DataSearch } from '@appbaseio/reactivesearch';
import Router from 'next/router';
import { Icon } from 'antd';
import { ElasticFields } from '../../config/ElasticConfig';

const App = () => {
  return (
    <div className='DfSearch'>
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
          style={{ fontSize: '14px', position: 'relative', top: '-1.6rem' }}
        />}
      />
    </div>
  );
};

export default App;
