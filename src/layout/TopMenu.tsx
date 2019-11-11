import React from 'react';
import { Menu, Button, Icon } from 'antd';
import InputAddress from '../components/utils/InputAddress';
import Search from '../components/search/Search';

type Props = {
  collapsed: boolean,
  toggleCollapsed: () => void
};

const InnerMenu = (props: Props) => {
  const { toggleCollapsed, collapsed } = props;
  return (
    <Menu mode='horizontal' theme='light'>
      <Button type='link' onClick={toggleCollapsed}>
      <Icon type={collapsed ? 'menu-unfold' : 'menu-fold'} style={{ fontSize: '28px', color: '#08c' }} theme='outlined' />
      </Button>
      <Menu.Item disabled style={{ position: 'relative', left: '12.2rem', width: '56.2rem', padding: '0' }}>
        <Search />
      </Menu.Item>
      <Menu.Item disabled style={{ position: 'relative', right: '-4rem' }}>
        <InputAddress
          className='DfTopBar--InputAddress'
          type='account'
        />
      </Menu.Item>
    </Menu>
  );
};

export default InnerMenu;
