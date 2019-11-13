import React from 'react';
import { DataSearch } from '@appbaseio/reactivesearch';
import Router from 'next/router';
import { Icon } from 'antd';

const App = () => {
  return (
    <div className='DfSearch'>
      <DataSearch
        componentId='q'
        dataField={['name', 'desc', 'title', 'body', 'username', 'fullname', 'about']}
        fieldWeights={[2, 1, 2, 1, 2, 2, 1]}
        URLParams
        onValueSelected={(value) => Router.push(`/search?q=${value}`)}
        placeholder='Search Subsocial'
        iconPosition='right'
        icon={<Icon
          type='search'
          style={{ fontSize: '14px', position: 'relative', top: '-1.6rem' }}
        />}
        innerClass={{ list: 'visible menu transition' }}
      />
    </div>
  );
};

export default App;
