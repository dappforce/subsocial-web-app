import React, { useState } from 'react';
import { Button, Icon } from 'antd';
import dynamic from 'next/dynamic';
const InputAddress = dynamic(() => import('../components/utils/InputAddress'), { ssr: false });
import Search from '../components/search/Search';
import { isBrowser, isMobile, MobileView } from 'react-device-detect';
import Router from 'next/router';
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext';
import BalanceDisplay from '@polkadot/ui-app/Balance';
import { useMyAccount } from '../components/utils/MyAccountContext';

const InnerMenu = () => {
  const [ show, setShow ] = useState(isBrowser);
  const { toggle } = useSidebarCollapsed();
  const { state: { address } } = useMyAccount();

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
        <div className='Account--module'>
          <InputAddress
              className='DfTopBar--InputAddress'
              type='account'
              withLabel={false}
          />
          <BalanceDisplay
            label='B: '
            className='Df--profile-balance'
            params={address}
          />
        </div>
      </div>
  </div>;
};

export default InnerMenu;
