import React from 'react'
import SelectAccount from './utils/SelectAccount';
import { Popover, Icon } from 'antd';
import Address from './Name'
import Avatar from './Avatar'
import { CommonAddressProps } from './utils/types';
import { withLoadedOwner } from './utils/withLoadedOwner';

export const AddressPopup: React.FunctionComponent<CommonAddressProps> = ({
  address,
  owner
}) => {
  const struct = owner?.struct;
  const content = owner?.content
  const reputation = struct?.reputation

  return <Popover
    placement='bottomRight'
    trigger='click'
    className='TopMenuAccount'
    overlayClassName='TopMenuAccountPopover'
    content={<SelectAccount reputation={reputation || 0}/>}
  >
    <div className='addressIcon'>
      <Avatar size={36} address={address} avatar={content?.avatar} />
    </div>
    <div className='addressInfo'>
      <Address asLink={false} owner={owner} address={address}/>
      {/* <RenderBalance address={address} /> */}
    </div>
    <Icon type='caret-down' />
  </Popover>;
}

export const AddressPopupWithOwner = withLoadedOwner(AddressPopup);

export default AddressPopupWithOwner;
