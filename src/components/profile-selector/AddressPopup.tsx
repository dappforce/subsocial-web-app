import React from 'react'
import { Dropdown } from 'antd';
import Address from '../profiles/address-views/Name'
import Avatar from '../profiles/address-views/Avatar'
import { AddressProps } from '../profiles/address-views/utils/types';
import { withLoadedOwner, withMyProfile } from '../profiles/address-views/utils/withLoadedOwner';
import { InfoDetails } from '../profiles/address-views';
import { AccountMenu } from 'src/components/profile-selector/AccountMenu';

type SelectAddressType = AddressProps & {
  withShortAddress?: boolean
}

export const SelectAddressPreview: React.FunctionComponent<SelectAddressType> = ({
  address,
  owner,
  withShortAddress
}) => (
  <div className='DfChooseAccount'>
    <div className='DfAddressIcon d-flex align-items-center'>
      <Avatar address={address} avatar={owner?.content?.avatar} />
    </div>
    <div className='DfAddressInfo ui--AddressComponents'>
      <Address asLink={false} owner={owner} address={address} withShortAddress={withShortAddress} />
      <InfoDetails address={address} />
    </div>
  </div>
)

export const AddressPopup: React.FunctionComponent<AddressProps> = ({
  address,
  owner
}) => {
  const menu = (
    <AccountMenu />
  );

  return <Dropdown
    overlay={menu}
    trigger={[ 'click' ]}
    overlayStyle={{ maxWidth: '366px' }}
  >
    <span className='DfCurrentAddress icon'>
      <SelectAddressPreview address={address} owner={owner} />
    </span>
  </Dropdown>
}

export const AddressPreviewWithOwner = withLoadedOwner(SelectAddressPreview)
export const MyAccountPopup = withMyProfile(AddressPopup);
