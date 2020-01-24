import * as React from 'react';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import { AllElasticIndexes, ElasticNodeURL } from '../config/ElasticConfig';
import { Layout } from 'antd';
const TopMenu = dynamic(() => import('./TopMenu'), { ssr: false });
import Menu from './SideMenu';
import { isBrowser } from 'react-device-detect';
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext';
import { Drawer } from 'antd-mobile';
import dynamic from 'next/dynamic';

const { Header, Sider, Content } = Layout;

type Props = {
  children: React.ReactNode
};

console.log('The browser: ', isBrowser);

const DesktopNav = () => {
  const { state: { collapsed } } = useSidebarCollapsed();
  return <div><Sider
    className='DfSider'
    trigger={null}
    collapsible
    collapsed={collapsed}
  >
    <Menu />
  </Sider></div>;
};

const MobileNav = () => {
  const { state: { collapsed }, toggle } = useSidebarCollapsed();
  return <Drawer
    className='DfMobileSideBar'
    style={{ minHeight: document.documentElement.clientHeight }}
    enableDragHandle
    contentStyle={{ color: '#A6A6A6', textAlign: 'center', paddingTop: 42 }}
    sidebar={<Menu />}
    open={!collapsed}
    onOpenChange={toggle}
  />;
};

export const Navigation = (props: Props) => {
  const { children } = props;

  return <ReactiveBase
    url={ElasticNodeURL}
    app={AllElasticIndexes.join(',')}
  >
  <Layout style={{ backgroundColor: '#fafafa !important' }}>
    <Header className='DfHeader'>
      <TopMenu />
    </Header>
    <Layout style={{ marginTop: '60px' }}>
      {isBrowser
        ? <DesktopNav />
        : <MobileNav />
      }
      <Content className='DfPageContent' style={{ padding: isBrowser ? '0 24px 24px' : '0 1rem' }}>{children}</Content>
    </Layout>
  </Layout>
  </ReactiveBase>;
};
