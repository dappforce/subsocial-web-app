import React, { FunctionComponent, useEffect, useMemo } from 'react';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import { AllElasticIndexes } from '../config/ElasticConfig';
import { Layout, Drawer } from 'antd';
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext';
import { elasticNodeURL } from 'src/components/utils/env';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const TopMenu = dynamic(() => import('./TopMenu'), { ssr: false });
const Menu = dynamic(() => import('./SideMenu'), { ssr: false });

const { Header, Sider, Content } = Layout;

interface Props {
  children: React.ReactNode;
}

const HomeNav = () => {
  const { state: { collapsed } } = useSidebarCollapsed();
  return <Sider
    className='DfSider'
    width='265'
    trigger={null}
    collapsible
    collapsed={collapsed}
  >
    <Menu />
  </Sider>;
};

const DefaultNav: FunctionComponent = () => {
  const { state: { collapsed }, hide } = useSidebarCollapsed();
  const { asPath } = useRouter()

  useEffect(() => hide(), [ asPath ])

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
  const { state: { asDrawer } } = useSidebarCollapsed()

  const content = useMemo(() => <Content className='DfPageContent'>{children}</Content>, [ children ]);

  return <ReactiveBase
    className='fontSizeNormal'
    url={elasticNodeURL}
    app={AllElasticIndexes.join(',')}
  >
    <Layout>
      <Header className='DfHeader'>
        <TopMenu />
      </Header>
      <Layout className='ant-layout-has-sider'>
        {asDrawer ? <DefaultNav /> : <HomeNav />}
        {content}
      </Layout>
    </Layout>
  </ReactiveBase>;
};
