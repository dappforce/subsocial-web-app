import React from 'react'
import SelectAccount from './utils/SelectAccount';
import { Dropdown, Menu } from 'antd';
import Address from './Name'
import Avatar from './Avatar'
import { CommonAddressProps } from './utils/types';
import { withLoadedOwner } from './utils/withLoadedOwner';
import { InfoDetails } from '.';

export const AddressPopup: React.FunctionComponent<CommonAddressProps> = ({
  address,
  owner
}) => {
  const struct = owner?.struct;
  const content = owner?.content
  const reputation = struct?.reputation
  const menu = (
    <Menu>
      <SelectAccount reputation={reputation || 0}/>
    </Menu>
  );

  return <Dropdown overlay={menu} placement="bottomLeft">
    <span className="DfCurrentAddress">
      <div className='DfAddressIcon'>
        <Avatar size={36} address={address} avatar={content?.avatar} />
      </div>
      <div className='DfAddressInfo ui--AddressComponents'>
        <Address asLink={false} owner={owner} address={address}/>
        <InfoDetails address={address} />
      </div>
    </span>
  </Dropdown>
}

export const AddressPopupWithOwner = withLoadedOwner(AddressPopup);

export default AddressPopupWithOwner;
