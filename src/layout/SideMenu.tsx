import React, { useState, useCallback } from 'react';
import { Menu, Badge } from 'antd';
import Router, { useRouter } from 'next/router';
import { useIsSignIn, useMyAddress } from '../components/auth/MyAccountContext';
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext';
import { Loading } from '../components/utils';
import { buildFollowedItems } from '../components/spaces/ListFollowingSpaces';
import useSubsocialEffect from 'src/components/api/useSubsocialEffect';
import Link from 'next/link';
import { SpaceData } from '@subsocial/types/dto';
import { newLogger, isEmptyArray } from '@subsocial/utils';
import { useNotifCounter } from '../components/utils/NotifCounter';
import { buildAuthorizedMenu, DefaultMenu, isDivider, PageLink } from './SideMenuItems';
import { OnBoardingCard } from 'src/components/onboarding';
import { useAuth } from 'src/components/auth/AuthContext';
import { useResponsiveSize } from 'src/components/responsive';
import { SpaceId } from '@subsocial/types/substrate/interfaces';
import { AllSpacesLink } from 'src/components/spaces/helpers';

const log = newLogger(SideMenu.name)

function SideMenu () {
  const { hide, state: { collapsed, asDrawer } } = useSidebarCollapsed();
  const { asPath } = useRouter();
  const myAddress = useMyAddress();
  const isLoggedIn = useIsSignIn();
  const { unreadCount } = useNotifCounter()
  const { state: { showOnBoarding } } = useAuth()
  const { isNotMobile } = useResponsiveSize()

  const [ followedSpacesData, setFollowedSpacesData ] = useState<SpaceData[]>([]);
  const [ loaded, setLoaded ] = useState(false);

  useSubsocialEffect(({ subsocial, substrate: { api } }) => {
    if (!myAddress) return;

    let isSubscribe = true;
    let unsub: () => any;

    const subLoadSpacesData = async () => {
      setLoaded(false);
      const readyApi = await api;
      unsub = await readyApi.query.spaceFollows.spacesFollowedByAccount(myAddress, async ids => {
        const spacesData = await subsocial.findPublicSpaces(ids as unknown as SpaceId[]);
        if (isSubscribe) {
          setFollowedSpacesData(spacesData);
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

  const menuItems = isLoggedIn && myAddress
    ? buildAuthorizedMenu(myAddress)
    : DefaultMenu

  const goToPage = ([ url, as ]: string[]) => {
    asDrawer && hide()
    Router.push(url, as).catch(err =>
      log.error(`Failed to navigate to a selected page. ${err}`))
  }

  const renderNotificationsBadge = () => {
    if (!unreadCount || unreadCount <= 0) return null
    return <Badge count={unreadCount} className="site-badge-count-4" />
  }

  const renderPageLink = useCallback((item: PageLink) => {
    const icon = item.icon
    if (item.hidden) {
      return null
    }

    return item.isAdvanced
      ? (
        <Menu.Item key={item.page[0]} >
          <a href='/bc'>
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
              {item.isNotifications && renderNotificationsBadge()}
            </a>
          </Link>
        </Menu.Item>
      )
  }, [])

  const renderSubscriptions = () => {
    if (isEmptyArray(followedSpacesData)) {
      return collapsed ? null : (
        <div className='text-center m-2'>
          <AllSpacesLink title='Exlore Spaces' />
        </div>
      )
    }

    return <Menu.ItemGroup
      className={`DfSideMenu--FollowedSpaces ${collapsed && 'collapsed'}`}
      key='followed'
      title={collapsed && !asDrawer ? 'Subs.' : 'My subscriptions'}
    >
      {loaded
        ? buildFollowedItems(followedSpacesData).map(renderPageLink)
        : <div className='text-center m-2'><Loading /></div>
      }
    </Menu.ItemGroup>
  }

  return (
    <Menu
      selectedKeys={[ asPath ]}
      mode='inline'
      theme='light'
      style={{ height: '100%', borderRight: 0 }}
    >
      {menuItems.map((item, i) => isDivider(item)
        ? <Menu.Divider key={'divider-' + i} />
        : renderPageLink(item)
      )}
      {isNotMobile && showOnBoarding && !collapsed && <OnBoardingCard />}
      {isLoggedIn && <Menu.Divider />}
      {isLoggedIn && renderSubscriptions()}
    </Menu>
  );
}

export default SideMenu
