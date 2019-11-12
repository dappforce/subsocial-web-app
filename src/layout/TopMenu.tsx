import React from 'react';
import { Menu, Button, Icon } from 'antd';
import InputAddress from '../components/utils/InputAddress';
import Search from '../components/search/Search';

type Props = {
  toggleCollapsed: () => void
};

const InnerMenu = (props: Props) => {
  const { toggleCollapsed } = props;
  return (
    <Menu mode='horizontal' theme='light' style={{ position: 'fixed', zIndex: 100, top: '0' }}>
      <Button type='link' onClick={toggleCollapsed}>
        <Icon type='unordered-list' style={{ fontSize: '20px', color: '#999' }} theme='outlined' />
      </Button>
      <Menu.Item key={'logo'} disabled>
        <span style={{ fontSize: '1.5rem' }}>Subsocial</span>
      </Menu.Item>
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
