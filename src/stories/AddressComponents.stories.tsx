import React from 'react';
import { AuthorPreview, ProfilePreview, AddressPopup } from '../components/profiles/address-views';
import { mockProfileDataAlice } from './mocks/SocialProfileMocks';
import { mockAccountAlice } from './mocks/AccountMocks'
export default {
  title: 'Profile | Components'
}

export const _AuthorPreview = () =>
    <AuthorPreview address={mockAccountAlice.toString()} owner={mockProfileDataAlice} details={<>{new Date().toLocaleString()}</>}/>

export const _ProfilePreview = () =>
    <ProfilePreview owner={mockProfileDataAlice} address={mockAccountAlice.toString()}/>

export const _ProfilePreviewMini = () =>
    <ProfilePreview owner={mockProfileDataAlice} address={mockAccountAlice.toString()} mini/>

export const __AddressPopup = () =>
    <AddressPopup owner={mockProfileDataAlice} address={mockAccountAlice.toString()} />
