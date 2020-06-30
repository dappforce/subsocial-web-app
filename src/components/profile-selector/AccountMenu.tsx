import React from 'react'
import { u32 } from '@polkadot/types'
import BN from 'bn.js'
import { SignOutButton } from 'src/components/auth/AuthButtons';
import { AnyAccountId } from '@subsocial/types';
import { AccountSelector } from './AccountSelector';
import PrivacyPolicyLinks from '../utils/PrivacyPoliceLinks';
import { Divider } from 'antd';

type Props = {
  address: AnyAccountId,
  reputation?: BN | u32 | string | number
}

export const AccountMenu: React.FunctionComponent<Props> = () => {
  return <div className='DfAccountMenu'>
    <AccountSelector />
    <Divider className='mb-3 mt-0' />
    <SignOutButton />
    <Divider className='mt-3 mb-0' />
    <PrivacyPolicyLinks />
  </div>
}

export default AccountMenu;
