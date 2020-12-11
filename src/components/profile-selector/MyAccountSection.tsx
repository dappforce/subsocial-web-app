import React from 'react'
import { SignOutButton } from 'src/components/auth/AuthButtons'
import { AccountSelector } from './AccountSelector'
import PrivacyPolicyLinks from '../utils/PrivacyPolicyLinks'
import { Divider } from 'antd'
import { ActionMenu } from './ActionMenu'

export const MyAccountSection = () => {
  return <div>
    <AccountSelector />
    <Divider className='my-0' />
    <ActionMenu />
    <Divider className='mb-3 mt-0' />
    <SignOutButton />
    <Divider className='mt-3 mb-0' />
    <PrivacyPolicyLinks />
  </div>
}

export default MyAccountSection
