import React from 'react';
import { AuthorPreview, ProfilePreview, AddressPopup, NameDetails } from '../components/profiles/address-views';
import { mockSocialAccountAlice, mockProfileAlice, mockContentAlice } from './mocks/SocialProfileMocks';
import { mockAccountAlice } from './mocks/AccountMocks'
export default {
  title: 'Profile | Components'
}

export const _AuthorPreview = () =>
    <AuthorPreview address={mockAccountAlice.toString()} socialAccount={mockSocialAccountAlice} profile={mockProfileAlice} content={mockContentAlice} details={<>{new Date().toLocaleString()}</>}/>

export const _ProfilePreview = () =>
    <ProfilePreview socialAccount={mockSocialAccountAlice} username={mockProfileAlice.username} content={mockContentAlice} address={mockAccountAlice.toString()}/>

export const __AddressPopup = () =>
    <AddressPopup socialAccount={mockSocialAccountAlice} username={mockProfileAlice.username} address={mockAccountAlice.toString()} content={mockContentAlice}/>
