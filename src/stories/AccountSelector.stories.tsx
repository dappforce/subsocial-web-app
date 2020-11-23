import React from 'react'
import { mockProfileDataAlice } from './mocks/SocialProfileMocks'
import { AddressPopup } from '../components/profiles/address-views'
import { mockAccountAlice } from './mocks/AccountMocks'
import { AccountSelectorView } from '../components/profile-selector/AccountSelector'

export default {
  title: 'Auth | AccountSelector'
}

export const _AddressPopup = () => (
  <div style={{ width: '200px', marginLeft: 'auto', marginRight: 'auto' }}><AddressPopup address={mockAccountAlice} owner={mockProfileDataAlice}/></div>
)

export const _AccountSelector = () => {
  const profilesByAddressMap = new Map()
  const aliceAddress = mockAccountAlice.toString()
  profilesByAddressMap.set(aliceAddress, mockProfileDataAlice)

  return <div style={{ width: '480px', marginLeft: 'auto', marginRight: 'auto' }}><AccountSelectorView
    extensionAddresses={[ aliceAddress, aliceAddress, aliceAddress ]}
    localAddresses={[ aliceAddress, aliceAddress, aliceAddress ]}
    developAddresses={[ aliceAddress, aliceAddress, aliceAddress ]}
    profilesByAddressMap={profilesByAddressMap}
    currentAddress={aliceAddress}
  /></div>
}
