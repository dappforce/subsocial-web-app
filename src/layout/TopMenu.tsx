import React from 'react';
import { Menu } from 'antd';
import InputAddress from '../components/utils/InputAddress';
import Search from '../components/search/Search';

const InnerMenu = () => {
  return (
    <Menu mode='horizontal' style={{ lineHeight: '64px' }} theme='light'>
      <Menu.Item disabled style={{ position: 'relative', left: '7.7rem', width: '49.3rem', padding: '0' }}>
        <Search />
      </Menu.Item>
      <Menu.Item disabled style={{ position: 'relative', right: '-13rem' }}>
        <InputAddress
          className='DfTopBar--InputAddress'
          type='account'
          withLabel={false}
        />
      </Menu.Item>
    </Menu>
  );
};

export default InnerMenu;
