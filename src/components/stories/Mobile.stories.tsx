
import React, { useState } from 'react';

import { withKnobs } from '@storybook/addon-knobs';
import './mobile.css';

import { Drawer, List, NavBar, Icon, SearchBar } from 'antd-mobile';

export default {
  title: 'Mobile',
  decorators: [ withKnobs ]
};

export const MobileSideBar = () => {
  const [ open, setOpen ] = useState(false);
  const [ searchCollapsed, setCollapsed ] = useState(true);
  const onOpenChange = () => {
    setOpen(!open);
  };

  const sidebar = (<List>
    {[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ].map((i, index) => {
      if (index === 0) {
        return (<List.Item key={index}
          thumb='https://zos.alipayobjects.com/rmsportal/eOZidTabPoEbPeU.png'
          multipleLine
        >Category</List.Item>);
      }
      return (<List.Item key={index}
        thumb='https://zos.alipayobjects.com/rmsportal/eOZidTabPoEbPeU.png'
      >Category{index}</List.Item>);
    })}
  </List>);

  return (<div>
    <NavBar leftContent={<Icon type='ellipsis' />} onLeftClick={onOpenChange}>
      {searchCollapsed ? <>
        <h4>S.</h4>
        <div onClick={() => setCollapsed(false)} style={{ width: 200 }}><Icon type='search'/></div></>
        : <SearchBar placeholder='Search' maxLength={8} onCancel={() => setCollapsed(true)}/>
      }
    </NavBar>
    <Drawer
      className='my-drawer'
      style={{ minHeight: document.documentElement.clientHeight }}
      enableDragHandle
      contentStyle={{ color: '#A6A6A6', textAlign: 'center', paddingTop: 42 }}
      sidebar={sidebar}
      open={open}
      onOpenChange={onOpenChange}
    >
      Click upper-left corner
    </Drawer>
  </div>);
};
