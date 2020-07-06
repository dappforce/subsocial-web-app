import React, { useState } from 'react';
import { Menu, Icon, Badge } from 'antd';
import Router, { useRouter } from 'next/router';
import { useIsSignIn, useMyAddress } from '../components/auth/MyAccountContext';
import { isMobile, isBrowser } from 'react-device-detect';
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext';
import { Loading } from '../components/utils/utils';
import { RenderFollowedList } from '../components/spaces/ListFollowingSpaces';
import useSubsocialEffect from 'src/components/api/useSubsocialEffect';
import Link from 'next/link';
import { SpaceData } from '@subsocial/types/dto';
import { newLogger } from '@subsocial/utils';
import { useNotifCounter } from '../components/utils/NotifCounter';
import { buildAuthorizedMenu, DefaultMenu, isDivider, PageLink } from './SideMenuItems';
import { OnBoardingCard } from 'src/components/onboarding';
import { useAuth } from 'src/components/auth/AuthContext';

const log = newLogger(SideMenu.name)

function SideMenu () {
  const { toggle, state: { collapsed, triggerFollowed } } = useSidebarCollapsed();
  const { pathname } = useRouter();
  const myAddress = useMyAddress();
  const isLoggedIn = useIsSignIn();
  const { unreadCount } = useNotifCounter()
  const { state: { showOnBoarding } } = useAuth()

  const [ followedSpacesData, setFollowedSpacesData ] = useState<SpaceData[]>([]);
  const [ loaded, setLoaded ] = useState(false);

  useSubsocialEffect(({ subsocial, substrate }) => {
    if (!myAddress) return;

    let isSubscribe = true;

    const loadSpacesData = async () => {
      setLoaded(false);
      const ids = await substrate.spaceIdsFollowedByAccount(myAddress)
      const spacesData = await subsocial.findVisibleSpaces(ids);
      if (isSubscribe) {
        setFollowedSpacesData(spacesData);
        setLoaded(true);
      }
    };

    loadSpacesData().catch(err =>
      log.error(`Failed to load spaces followed by the current user. ${err}`))

    return () => { isSubscribe = false; };
  }, [ triggerFollowed, myAddress ]);

  const menuItems = isLoggedIn && myAddress
    ? buildAuthorizedMenu(myAddress)
    : DefaultMenu

  const goToPage = ([ url, as ]: string[]) => {
    isMobile && toggle()
    Router.push(url, as).catch(err =>
      log.error(`Failed to navigate to a selected page. ${err}`))
  }

  const renderNotificationsBadge = () => {
    if (!unreadCount || unreadCount <= 0) return null
    return <Badge count={unreadCount} className="site-badge-count-4" />
  }

  const renderPageLink = (item: PageLink) => {
    return item.isAdvanced
      ? (
        <Menu.Item key={item.page[0]} >
          <a href='/bc'>
            <Icon type='block' />
            <span>Advanced</span>
          </a>
        </Menu.Item>
      ) : (
        <Menu.Item key={item.page[0]} onClick={() => goToPage(item.page)}>
          <Link href={item.page[0]} as={item.page[1]}>
            <a>
              <Icon type={item.image} />
              <span>{item.name}</span>
              {item.isNotifications && renderNotificationsBadge()}
            </a>
          </Link>
        </Menu.Item>
      )
  }

  const renderSubscriptions = () =>
    <Menu.ItemGroup
      className={`DfSideMenu--FollowedSpaces ${collapsed && 'collapsed'}`}
      key='followed'
      title='My subscriptions'
    >
      {loaded
        ? <RenderFollowedList followedSpacesData={followedSpacesData} />
        : <div className='text-center m-2'><Loading /></div>
      }
    </Menu.ItemGroup>

  return (
    <Menu
      selectedKeys={[ pathname ]}
      mode='inline'
      theme='light'
      style={{ height: '100%', borderRight: 0 }}
    >
      {menuItems.map((item, i) => isDivider(item)
        ? <Menu.Divider key={'divider-' + i} />
        : renderPageLink(item)
      )}
      {isBrowser && showOnBoarding && !collapsed && <OnBoardingCard />}
      {isLoggedIn && <Menu.Divider />}
      {isLoggedIn && renderSubscriptions()}
    </Menu>
  );
}

export default SideMenu
