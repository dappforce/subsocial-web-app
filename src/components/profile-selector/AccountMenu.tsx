import React from 'react'
import { u32 } from '@polkadot/types'
import BN from 'bn.js'
import { SignOutButton, SwitchAccountButton } from 'src/components/auth/AuthButtons';
import { Menu, Icon } from 'antd';
import { buildAuthorizedMenu } from 'src/layout/SideMenuItems'
import { MenuItems } from 'src/layout/SideMenu';
import { AnyAccountId } from '@subsocial/types';
const { Item } = Menu

type Props = {
  address: AnyAccountId,
  reputation?: BN | u32 | string | number
}

export const AccountMenu: React.FunctionComponent<Props> = ({ address }) => {
  const menuItems = buildAuthorizedMenu(address.toString())

  return <MenuItems
    beforeItems={<Item key='switch-account' className='DfMenuItems' >
      <Icon type='user' />
      <SwitchAccountButton />
    </Item>}
    items={menuItems}
    afterItems={
      <Item key='sign-out' className='DfMenuItems' >
        <Icon type='user' />
        <SignOutButton />
      </Item>
    } />
}

export default AccountMenu;
