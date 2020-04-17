import React from 'react'
import SelectAccount from './utils/SelectAccount';
import { Popover, Icon } from 'antd';
import Address from './utils/Name'
import Avatar from './utils/Avatar'
import { CommonAddressProps } from './utils/types';
import { SocialAccount } from '@subsocial/types/substrate/interfaces';
import { ProfileContent } from '@subsocial/types';

export const AddressPopup: React.FunctionComponent<CommonAddressProps> = ({
  address,
  socialAccount = {} as SocialAccount,
  username,
  content = {} as ProfileContent
}) => {
  const { reputation } = socialAccount
  const { fullname, avatar } = content
  return <Popover
    placement='bottomRight'
    trigger='click'
    className='TopMenuAccount'
    overlayClassName='TopMenuAccountPopover'
    content={<SelectAccount reputation={reputation}/>}
  >
    <div className='addressIcon'>
      <Avatar size={36} address={address} avatar={avatar} />
    </div>
    <div className='addressInfo'>
      <Address asLink={false} fullname={fullname} username={username} address={address}/>
      {/* <RenderBalance address={address} /> */}
    </div>
    <Icon type='caret-down' />
  </Popover>;
}
