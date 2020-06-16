import React from 'react'
import { Dropdown, Menu } from 'antd';
import Address from './Name'
import Avatar from './Avatar'
import { AddressProps } from './utils/types';
import { withLoadedOwner } from './utils/withLoadedOwner';
import { InfoDetails } from '.';
import { isBrowser } from 'react-device-detect';
import { SelectAccount } from 'src/components/profile-selector/AccountMenu';

export const SelectAddressPreview: React.FunctionComponent<AddressProps> = ({
  address,
  owner
}) => (
  <>
    <div className='DfAddressIcon'>
      <Avatar address={address} avatar={owner?.content?.avatar} />
    </div>
    <div className='DfAddressInfo ui--AddressComponents'>
      <Address asLink={isBrowser} owner={owner} address={address} />
      <InfoDetails address={address} />
    </div>
  </>
)

export const AddressPopup: React.FunctionComponent<AddressProps> = ({
  address,
  owner
}) => {
  const struct = owner?.struct;
  const reputation = struct?.reputation
  const menu = (
    <Menu>
      <SelectAccount address={address} reputation={reputation || 0}/>
    </Menu>
  );

  return <Dropdown overlay={menu} placement="bottomLeft">
    <span className='DfCurrentAddress icon'><SelectAddressPreview address={address} owner={owner} /></span>
  </Dropdown>
}

export const AddressPopupWithOwner = withLoadedOwner(AddressPopup);
export const AddressPreviewWithOwner = withLoadedOwner(SelectAddressPreview)
export default AddressPopupWithOwner;
