import React, { useState } from 'react';
import { Button, Icon } from 'antd';
import InputAddress from '../components/utils/InputAddress';
import Search from '../components/search/Search';
import { isBrowser, isMobile, BrowserView, MobileView } from 'react-device-detect';

type Props = {
  toggleCollapsed: () => void
};

const InnerMenu = (props: Props) => {
  const [ show, setShow ] = useState(isBrowser);

  return isMobile && show
  ? <div className='DfTopBar DfTopBar--search'>
    <Icon type='close-circle' className='MobileSearchIcon' onClick={() => setShow(false)} />
    <Search/>
  </div>
  : <div className='DfTopBar'>
      <div className='DfTopBar--leftContent'>
        <Button type='link' onClick={props.toggleCollapsed}>
          <Icon type='unordered-list' style={{ fontSize: '20px', color: '#999' }} theme='outlined' />
        </Button>
          <span style={{ fontSize: '1.5rem' }}>{isBrowser ? 'Subsocial' : 'S.'}</span>
      </div>
      <BrowserView><Search/></BrowserView>
      <div className='DfTopBar--rightContent'>
        <MobileView>
          {isMobile &&
          <Icon type='search' className='MobileSearchIcon' onClick={() => setShow(true)} />}
        </MobileView>
        <InputAddress
          className='DfTopBar--InputAddress'
          type='account'
          withLabel={false}
        />
      </div>
  </div>;
};

export default InnerMenu;
