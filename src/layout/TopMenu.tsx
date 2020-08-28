import React, { useState } from 'react';
import { CloseCircleOutlined, SearchOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import Search from '../components/search/Search';
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext';
import AuthorizationPanel from '../components/auth/AuthorizationPanel';
import Link from 'next/link';
import { isMobile, isBrowser } from 'src/config/Size.config';

const InnerMenu = () => {
  const { toggle } = useSidebarCollapsed();
  const [ show, setShow ] = useState(isBrowser);

  const logoImg = isMobile ? '/subsocial-sign.svg' : '/subsocial-logo.svg'

  return isMobile && show
    ? <div className='DfTopBar DfTopBar--search'>
      <Search/>
      <CloseCircleOutlined className='DfCloseSearchIcon' onClick={() => setShow(false)} />
    </div>
    : <div className='DfTopBar'>
      <div className='DfTopBar--leftContent'>
        <Button type='link' onClick={toggle} /* onMouseEnter={open} */ className='DfBurgerIcon'>
          <UnorderedListOutlined style={{ fontSize: '20px', color: '#999' }} />
        </Button>
        <Link href='/' as='/'>
          <a className={`DfBrand ${isMobile ? 'mobile' : ''}`}>
            <img src={logoImg} alt='Subsocial' />
          </a>
        </Link>
      </div>
      {isBrowser && <Search/>}
      <div className='DfTopBar--rightContent'>
        {isMobile &&
          <SearchOutlined className='DfSearchIcon' onClick={() => setShow(true)} />}
        <AuthorizationPanel />
      </div>
    </div>;
};

export default InnerMenu;
