import React, { useEffect } from 'react';
import { DataSearch } from '@appbaseio/reactivesearch';
import Router from 'next/router';
import { SearchOutlined } from '@ant-design/icons';
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
          ElasticFields.space.name,
          ElasticFields.space.desc,
          ElasticFields.space.tags,
          ElasticFields.post.title,
          ElasticFields.post.body,
          ElasticFields.post.tags,
          ElasticFields.comment.body,
          ElasticFields.profile.username,
          ElasticFields.profile.fullname,
          ElasticFields.profile.about
        ]}
        fieldWeights={[ 3, 1, 2, 3, 1, 2, 2, 2, 3, 1 ]}
        URLParams
        autoFocus
        ref={(c: any) => {
          if (focus || isBrowser) return;
          input = c._inputRef;
        }}
        onValueSelected={(value) => Router.push(`/search?q="${value}"`)}
        placeholder='Search for spaces, posts or comments'
        iconPosition='left'
        icon={<SearchOutlined style={{ position: 'relative', top: '-0.9rem' }} />}
      />
    </div>
  );
};

export default App;
