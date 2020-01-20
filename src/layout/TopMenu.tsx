import React, { useState } from 'react';
import { Button, Icon } from 'antd';
import InputAddress from '../components/utils/InputAddress';
import Search from '../components/search/Search';
import { isBrowser, isMobile, MobileView } from 'react-device-detect';
import Router from 'next/router';
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext';

const InnerMenu = () => {
  const [ show, setShow ] = useState(isBrowser);
  const { toggle } = useSidebarCollapsed();

  return isMobile && show
  ? <div className='DfTopBar DfTopBar--search'>
    <Search/>
    <Icon type='close-circle' className='DfCloseSearchIcon' onClick={() => setShow(false)} />
  </div>
  : <div className='DfTopBar'>
      <div className='DfTopBar--leftContent'>
        <Button type='link' onClick={toggle} className='DfBurgerIcon'>
          <Icon type='unordered-list' style={{ fontSize: '20px', color: '#999' }} theme='outlined' />
        </Button>
          <span className='DfBrand' onClick={() => Router.push('/')}>{'Subsocial'}</span>
      </div>
      {isBrowser && <Search/>}
      <div className='DfTopBar--rightContent'>
        <MobileView>
          {isMobile &&
          <Icon type='search' className='DfSearchIcon' onClick={() => setShow(true)} />}
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
