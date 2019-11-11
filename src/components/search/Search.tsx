import React from 'react';
import { DataSearch } from '@appbaseio/reactivesearch';
import ViewBlog from '../blogs/ViewBlog';
import { ViewPost } from '../posts/ViewPost';
import Router from 'next/router';
import ViewProfile from '../profiles/ViewProfile';

const App = () => {
  const getPreviewComponent = (index: string, id: string) => {
    switch (index) {
      case 'subsocial_blogs':
        return <ViewBlog key={id} id={id} nameOnly />;
      case 'subsocial_posts':
        return <ViewPost key={id} id={id} nameOnly />;
      case 'subsocial_profiles':
        return <ViewProfile key={id} id={id} nameOnly />;
      default:
        return <ViewBlog key={id} id={id} nameOnly />;
    }
  };

  return (
    // <>
    //   <ReactiveComponent
    //     componentId='search'
    //     render={(loading) => {
    //       return (
    //         <div className={'ui ' + (loading === true ? 'loading' : '') + ' search DfSearch'}>
    //           <div className='ui icon input'>
    //             <input className='prompt' type='text' placeholder='Search for data' />
    //             <i className='search icon'></i>
    //           </div>
    //           <div className='results'>
    //             <a className='result'>
    //               <div className='content'>
    //                 <div className='title'>Blog</div>
    //               </div>
    //             </a>
    //           </div>
    //         </div>
    //       );
    //     }}
    //   />
    <DataSearch
      componentId='q'
      dataField={['name', 'title', 'username']}
      queryFormat='and'
      URLParams
      parseSuggestion={(data) => ({
        label: (
          <div>{getPreviewComponent(data.source._index, data.source._id)}</div>
        ),
        value: data.source.name,
        source: data.source
      })}
      onValueSelected={(value) => Router.push(`/search?q=${value}`)}

      placeholder='Search for data'
      iconPosition='right'
      className='DfSearch'
      innerClass={{
        list: 'visible menu transition'
      }}
    />
    // </>
  );
};

export default App;
