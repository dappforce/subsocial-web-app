import React, { useState } from 'react';
import { Button, Icon } from 'antd';
// import InputAddress from '../components/utils/InputAddress';
import { InputAddress } from '@polkadot/react-components/InputAddress';
import Search from '../components/search/Search';
import { isBrowser, isMobile, MobileView } from 'react-device-detect';
import Router from 'next/router';

type Props = {
  toggleCollapsed: () => void
};

const InnerMenu = (props: Props) => {
  const [ show, setShow ] = useState(isBrowser);

  return isMobile && show
  ? <div className='DfTopBar DfTopBar--search'>
    <Search/>
    <Icon type='close-circle' className='DfCloseSearchIcon' onClick={() => setShow(false)} />
  </div>
  : <div className='DfTopBar'>
      <div className='DfTopBar--leftContent'>
        <Button type='link' onClick={props.toggleCollapsed} className='DfBurgerIcon'>
          <Icon type='unordered-list' style={{ fontSize: '20px', color: '#999' }} theme='outlined' />
        </Button>
          <span style={{ fontSize: '1.5rem' }} onClick={() => Router.push('/')}>{isBrowser ? 'Subsocial' : 'S.'}</span>
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
