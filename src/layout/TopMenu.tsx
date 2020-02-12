import React, { useState } from 'react';
import { Button, Icon } from 'antd';
import Search from '../components/search/Search';
import { isBrowser, isMobile, MobileView } from 'react-device-detect';
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext';
import { useMyAccount, checkIfLoggedIn } from '../components/utils/MyAccountContext';
import AddressComponents from '../components/utils/AddressComponents';
import LogInButton from '../components/utils/LogIn';
import Link from 'next/link';

const InnerMenu = () => {
  const [ show, setShow ] = useState(isBrowser);
  const { toggle } = useSidebarCollapsed();
  const { state: { address } } = useMyAccount();
  const isLoggedIn = checkIfLoggedIn();

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
        <Link href='/'><a className='DfBrand'>{'Subsocial'}</a></Link>
      </div>
      {isBrowser && <Search/>}
      <div className='DfTopBar--rightContent'>
        <MobileView>
          {isMobile &&
          <Icon type='search' className='DfSearchIcon' onClick={() => setShow(true)} />}
        </MobileView>
        {isLoggedIn ?
        <AddressComponents
          className='profileName'
          value={address}
          isShort={true}
          isPadded={false}
          size={30}
          variant='address-popup'
        /> : <LogInButton/>}
      </div>
  </div>;
};

export default InnerMenu;
