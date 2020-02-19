import React, { useEffect } from 'react';
import { DataSearch } from '@appbaseio/reactivesearch';
import Router from 'next/router';
import { Icon } from 'antd';
import { ElasticFields } from '../../config/ElasticConfig';
import { isBrowser } from 'react-device-detect';

const App = () => {
  let focus = false;
  let input: HTMLInputElement | undefined;

  useEffect(() => {
    if (!input) return;

    input.focus();
    focus = true;
  }, [ focus ]);

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
          ElasticFields.profile.about
        ]}
        fieldWeights={[ 2, 1, 2, 1, 2, 2, 1 ]}
        URLParams
        autoFocus
        ref={(c: any) => {
          if (focus || isBrowser) return;
          input = c._inputRef;
        }}
        onValueSelected={(value) => Router.push(`/search?q="${value}"`)}
        placeholder='Search Subsocial'
        iconPosition='left'
        icon={<Icon
          type='search'
          style={{ fontSize: '14px', position: 'relative', top: '-0.9rem' }}
        />}
      />
    </div>
  );
};

export default App;
