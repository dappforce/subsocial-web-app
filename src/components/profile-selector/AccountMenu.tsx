import React from 'react'
import { u32 } from '@polkadot/types'
import BN from 'bn.js'
import { ZERO } from '../utils';
import { SignOutButton, ChangeAccountButton } from 'src/components/auth/AuthButtons';
import { Menu, Icon } from 'antd';
import { buildAuthorizedMenu } from 'src/layout/SideMenuItems'
import { MenuItems } from 'src/layout/SideMenu';
import { AnyAccountId } from '@subsocial/types';
const { Item } = Menu

type Props = {
  address: AnyAccountId,
  reputation?: BN | u32 | string | number
}

export const SelectAccount: React.FunctionComponent<Props> = ({ address, reputation = ZERO }) => {
  const menuItems = buildAuthorizedMenu(address.toString())

  return <div className='DfSelectAccount'>
    <div className='DfProfileInfo'>
        My reputation: {reputation.toString()}
    </div>
    <MenuItems
      beforeItems={<Item key='change-account' className='DfMenuItems' >
        <Icon type='user' />
        <ChangeAccountButton />
      </Item>}
      items={menuItems} />
    <SignOutButton />
  </div>;
}

export default SelectAccount;
