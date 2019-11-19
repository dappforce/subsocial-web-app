import React from 'react';
import { Button, Icon } from 'antd';
import InputAddress from '../components/utils/InputAddress';
import Search from '../components/search/Search';

type Props = {
  toggleCollapsed: () => void
};

const InnerMenu = (props: Props) => (
    <>
      <div>
        <Button type='link' onClick={props.toggleCollapsed}>
          <Icon type='unordered-list' style={{ fontSize: '20px', color: '#999' }} theme='outlined' />
        </Button>
        <span style={{ fontSize: '1.5rem' }}>Subsocial</span>
      </div>
      <Search />
      <div>
        <InputAddress
          className='DfTopBar--InputAddress'
          type='account'
          withLabel={false}
        />
    </div>
  </>
);

export default InnerMenu;
