import React from 'react'
import SelectAccount from './utils/SelectAccount';
import { Popover, Icon } from 'antd';
import Address from './Name'
import Avatar from './Avatar'
import { CommonAddressProps } from './utils/types';
import { withLoadedAuthor } from './utils/withLoadedAuthor';

export const AddressPopup: React.FunctionComponent<CommonAddressProps> = ({
  address,
  author
}) => {
  const struct = author?.struct;
  const content = author?.content
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
      <Address asLink={false} author={author} address={address}/>
      {/* <RenderBalance address={address} /> */}
    </div>
    <Icon type='caret-down' />
  </Popover>;
}

export const AddressPopupWithAuthor = withLoadedAuthor(AddressPopup);

export default AddressPopupWithAuthor;
