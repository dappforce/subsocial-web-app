import React, { useState } from 'react';
import { Button, Icon } from 'antd';
import Search from '../components/search/Search';
import { isBrowser, isMobile, MobileView } from 'react-device-detect';
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext';
import { AuthorizationPanel } from '../components/utils/LogIn';
import Link from 'next/link';

const InnerMenu = () => {
  const { toggle, show: open } = useSidebarCollapsed();
  const [ show, setShow ] = useState(isBrowser);

  const logoImg = isMobile ? '/subsocial-sign.svg' : '/subsocial-logo.svg'

  return isMobile && show
    ? <div className='DfTopBar DfTopBar--search'>
      <Search/>
      <Icon type='close-circle' className='DfCloseSearchIcon' onClick={() => setShow(false)} />
    </div>
    : <div className='DfTopBar'>
      <div className='DfTopBar--leftContent'>
        <Button type='link' onClick={toggle} onMouseEnter={open} className='DfBurgerIcon'>
          <Icon type='unordered-list' style={{ fontSize: '20px', color: '#999' }} theme='outlined' />
        </Button>
        <Link href='/'>
          <a className={`DfBrand ${isMobile ? 'mobile' : ''}`}>
            <img src={logoImg} alt='Subsocial' />
          </a>
        </Link>
      </div>
      {isBrowser && <Search/>}
      <div className='DfTopBar--rightContent'>
        <MobileView>
          {isMobile &&
          <Icon type='search' className='DfSearchIcon' onClick={() => setShow(true)} />}
        </MobileView>
        <AuthorizationPanel />
      </div>
    </div>
};

export default InnerMenu;
