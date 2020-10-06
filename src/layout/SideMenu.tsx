import React, { useState, useCallback } from 'react';
import { Menu, Badge } from 'antd';
import Router, { useRouter } from 'next/router';
import { useIsSignIn, useMyAddress } from '../components/auth/MyAccountContext';
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext';
import { Loading } from '../components/utils';
import { buildFollowedItems } from '../components/spaces/ListFollowingSpaces';
import useSubsocialEffect from 'src/components/api/useSubsocialEffect';
import Link from 'next/link';
import { ParsedUrlQuery } from 'querystring';
import { newLogger, isEmptyArray } from '@subsocial/utils';
import { useNotifCounter } from '../components/utils/NotifCounter';
import { buildAuthorizedMenu, DefaultMenu, isDivider, PageLink } from './SideMenuItems';
import { OnBoardingCard } from 'src/components/onboarding';
import { useAuth } from 'src/components/auth/AuthContext';
import { useResponsiveSize } from 'src/components/responsive';
import { SpaceId } from '@subsocial/types/substrate/interfaces';
import { AllSpacesLink } from 'src/components/spaces/helpers';
import { useSubsocialApi } from 'src/components/utils/SubsocialApiContext';
import { getPageOfIds } from 'src/components/utils/getIds';
import { InfiniteList } from 'src/components/lists/InfiniteList';

const log = newLogger(SideMenu.name)

const goToPage = ([ url, as ]: string[]) => {
  Router.push(url, as).catch(err =>
    log.error(`Failed to navigate to a selected page. ${err}`))
}

const renderPageLink = (item: PageLink, unreadCount?: number) => {
  const { icon } = item
  if (item.hidden) {
    return null
  }

  return item.isAdvanced
    ? (
      <Menu.Item key={item.page[0]} >
        <a href={item.page[0]} target='_blank'>
          {icon}
          <span>{item.name}</span>
        </a>
      </Menu.Item>
    ) : (
      <Menu.Item key={item.page[1] || item.page[0]} onClick={() => goToPage(item.page)}>
        <Link href={item.page[0]} as={item.page[1]}>
          <a>
            {icon}
            <span className='MenuItemName'>{item.name}</span>
            {item.isNotifications && renderNotificationsBadge(unreadCount)}
          </a>
        </Link>
      </Menu.Item>
    )
}

const renderNotificationsBadge = (unreadCount?: number) => {
  if (!unreadCount || unreadCount <= 0) return null
  return <Badge count={unreadCount} className="site-badge-count-4" />
}

const MySubscriptions = () => {
  const [ followedSpaceIds, setFollowedSpacesIds ] = useState<SpaceId[]>([]);
  const [ loaded, setLoaded ] = useState(false);
  const { state: { collapsed } } = useSidebarCollapsed();
  const { subsocial, isApiReady } = useSubsocialApi()
  const myAddress = useMyAddress();

  useSubsocialEffect(({ subsocial, substrate: { api } }) => {
    if (!myAddress) return;

    let isSubscribe = true;
    let unsub: () => any;

    const subLoadSpacesData = async () => {
      setLoaded(false);
      const readyApi = await api;
      unsub = await readyApi.query.spaceFollows.spacesFollowedByAccount(myAddress, async ids => {
        if (isSubscribe) {
          setFollowedSpacesIds(ids as unknown as SpaceId[]);
          setLoaded(true);
        }
      })

    };

    subLoadSpacesData().catch(err =>
      log.error(`Failed to load spaces followed by the current user. ${err}`))

    return () => {
      isSubscribe = false;
      unsub && unsub()
    };
  }, [ myAddress ]);

  const getNextPage = useCallback(async (page: number, size: number) => {
    if (!isApiReady) return [];

    const idsOfPage = getPageOfIds(followedSpaceIds, { page, size } as unknown as ParsedUrlQuery)
    const spacesData = await subsocial.findPublicSpaces(idsOfPage);

    return spacesData
  }, [ followedSpaceIds, isApiReady ])

  if (isEmptyArray(followedSpaceIds)) {
    return collapsed ? null : (
      <div className='text-center m-2'>
        <AllSpacesLink title='Exlore Spaces' />
      </div>
    )
  }

  return <InfiniteList
    loadMore={getNextPage}
    customList={({ dataSource = [] }) => {
      console.log('dataSource', dataSource)
      return loaded
          ? <>{buildFollowedItems(dataSource).map(renderPageLink)}</>
          : <div className='text-center m-2'><Loading /></div>}
      }
    initialLoad
  />

}

function SideMenu () {
  const { state: { collapsed } } = useSidebarCollapsed();
  const { asPath } = useRouter();
  const myAddress = useMyAddress();
  const isLoggedIn = useIsSignIn();
  const { unreadCount } = useNotifCounter()
  const { state: { showOnBoarding } } = useAuth()
  const { isNotMobile } = useResponsiveSize()




  const menuItems = isLoggedIn && myAddress
    ? buildAuthorizedMenu(myAddress)
    : DefaultMenu

  return (
    <Menu
      selectedKeys={[ asPath ]}
      mode='inline'
      theme='light'
      style={{ height: '100%', borderRight: 0 }}
    >
      {menuItems.map((item, i) => isDivider(item)
        ? <Menu.Divider key={'divider-' + i} />
        : renderPageLink(item, unreadCount)
      )}
      {isNotMobile && showOnBoarding && !collapsed && <OnBoardingCard />}
      {isLoggedIn && <Menu.Divider />}
      {isLoggedIn && <MySubscriptions />}
    </Menu>
  );
}

export default SideMenu
