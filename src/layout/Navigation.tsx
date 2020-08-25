import React, { FunctionComponent, useEffect } from 'react';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import { AllElasticIndexes } from '../config/ElasticConfig';
import { Layout, Drawer } from 'antd';
import { isBrowser, isMobile } from 'react-device-detect';
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext';
import { newLogger } from '@subsocial/utils';
import { isHomePage } from 'src/components/utils';
import { ElasticNodeURL } from 'src/components/utils/env';

import Menu from './SideMenu';
import dynamic from 'next/dynamic';
const TopMenu = dynamic(() => import('./TopMenu'), { ssr: false });

const log = newLogger('Navigation')

const { Header, Sider, Content } = Layout;

interface Props {
  children: React.ReactNode;
}

const asDrawer = !isHomePage() || isMobile

log.debug('Are we in a browser?', isBrowser);

const HomeNav = () => {
  const { state: { collapsed } } = useSidebarCollapsed();
  return <Sider
    className='DfSider'
    width='255'
    trigger={null}
    collapsible
    collapsedWidth={asDrawer ? 0 : undefined}
    collapsed={collapsed}
    defaultCollapsed={false}
  >
    <Menu />
  </Sider>;
};

const DefaultNav: FunctionComponent = ({ children }) => {
  const { state: { collapsed }, hide } = useSidebarCollapsed();

  useEffect(() => hide(), [ false ])

  return <Drawer
    className='DfSideBar'
    bodyStyle={{ padding: 0 }}
    placement='left'
    closable={false}
    onClose={hide}
    visible={!collapsed}
    getContainer={false}
    keyboard
  >
    <Menu />
  </Drawer>
};

export const Navigation = (props: Props): JSX.Element => {
  const { children } = props;

  const MainContent = () => <Content className='DfPageContent'>{children}</Content>;

  return <ReactiveBase
    className='fontSizeNormal'
    url={ElasticNodeURL}
    app={AllElasticIndexes.join(',')}
  >
    <Layout>
      <Header className='DfHeader'>
        <TopMenu />
      </Header>
      <Layout>
        {asDrawer ? <DefaultNav /> : <HomeNav />}
        <MainContent />
      </Layout>
    </Layout>
  </ReactiveBase>;
};
