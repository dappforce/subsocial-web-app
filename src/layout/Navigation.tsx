import React, { FunctionComponent } from 'react';
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

const MobileNav: FunctionComponent = ({ children }) => {
  const { state: { collapsed }, toggle } = useSidebarCollapsed();
  return <Drawer
    className='DfMobileSideBar'
    style={{ minHeight: document.documentElement.clientHeight }}
    enableDragHandle
    contentStyle={{ color: '#A6A6A6', textAlign: 'center', paddingTop: 42 }}
    sidebar={<Menu />}
    open={!collapsed}
    onOpenChange={toggle}
  >
    {children}
  </Drawer>;
};

export const Navigation = (props: Props) => {
  const { children } = props;

  const MainContent = () => <Content className='DfPageContent'>{children}</Content>;

  return <ReactiveBase
    className='fontSizeNormal'
    url={ElasticNodeURL}
    app={AllElasticIndexes.join(',')}
  >
  <Layout style={{ backgroundColor: '#fafafa !important' }}>
    <Header className='DfHeader'>
      <TopMenu />
    </Header>
    <Layout style={{ marginTop: '60px' }}>
      {isBrowser
        ? <>
            <DesktopNav />
            <MainContent/>
          </>
        : <MobileNav>
            <MainContent/>
          </MobileNav>
      }
    </Layout>
  </Layout>
  </ReactiveBase>;
};
