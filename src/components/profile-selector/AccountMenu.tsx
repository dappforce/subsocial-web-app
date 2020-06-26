import React from 'react'
import { u32 } from '@polkadot/types'
import BN from 'bn.js'
import { SignOutButton, SwitchAccountButton } from 'src/components/auth/AuthButtons';
import { Menu, Icon } from 'antd';
import { AnyAccountId } from '@subsocial/types';
const { Item } = Menu

type Props = {
  address: AnyAccountId,
  reputation?: BN | u32 | string | number
}

export const AccountMenu: React.FunctionComponent<Props> = ({ address }) => {
  return <>
    <Menu>
      <Item key='switch-account' className='DfMenuItems' >
        <Icon type='user' />
        <SwitchAccountButton />
      </Item>
      <SignOutButton />
    </Menu>
  </>
}

export default AccountMenu;
