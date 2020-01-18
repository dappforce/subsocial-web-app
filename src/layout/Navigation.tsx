import * as React from 'react';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import { AllElasticIndexes, ElasticNodeURL } from '../config/ElasticConfig';
import { Layout } from 'antd';
import dynamic from 'next/dynamic';
const TopMenu = dynamic(() => import('./TopMenu'), { ssr: false });
import Menu from './SideMenu';
import { isBrowser } from 'react-device-detect';
import { Drawer } from 'antd-mobile';
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext';

const { Header, Sider, Content } = Layout;

type Props = {
  children: React.ReactNode
};

console.log('The browser: ', isBrowser);

export const Navigation = (props: Props) => {
  const { children } = props;

  const { state: { collapsed }, toggle } = useSidebarCollapsed();

  const DesktopNav = () => (
    <>
      <Sider
        width={250}
        className='DfSider'
        trigger={null}
        collapsed={collapsed}
      >
        <Menu />
      </Sider>
      <Layout className='DfPageContent' style={{ padding: '0 24px 24px', marginLeft: collapsed ? '80px' : '250px' }}>
        <Content>{children}</Content>
      </Layout>
    </>
  );

  const MobileNav = () => (
    <Drawer
      className='DfMobileSideBar'
      style={{ minHeight: document.documentElement.clientHeight }}
      enableDragHandle
      contentStyle={{ color: '#A6A6A6', textAlign: 'center', paddingTop: 42 }}
      sidebar={<Menu />}
      open={!collapsed}
      onOpenChange={toggle}
    >
      <Layout>
        <Content className='DfPageContent'>{children}</Content>
      </Layout>
    </Drawer>
  );

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
    </Layout>
  </Layout>,
  </ReactiveBase>;
};
