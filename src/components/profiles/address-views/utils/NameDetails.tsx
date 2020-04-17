import React from 'react'
import { ProfileProps } from './types';
import { toShortAddress } from '@polkadot/react-components/util';
import Link from 'next/link';

export const NameDetails: React.FunctionComponent<ProfileProps> = ({ address, fullname, username }) => {
  const shortAddress = toShortAddress(address);
  return (
    <Link href='/profile/[address]' as={`/profile/${address}`}>
      <a className='ui--AddressComponents-address'>
        <b className='AddressComponents-fullname'>{fullname || shortAddress}</b>
        <div className='DfPopup-username'>{username && `${username} - `}{shortAddress}</div>
      </a>
    </Link>
  );
};

export default NameDetails;
