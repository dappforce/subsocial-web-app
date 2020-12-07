import { Profile } from '@subsocial/types/substrate/interfaces'
import { ProfileContent } from '@subsocial/types'
import { ProfileData, PublicProfileStruct } from 'src/types'
import { mockAccountAlice } from './AccountMocks'
import { aliceAvatarData } from './images'

const id = mockAccountAlice.toString()

export const mockSocialAccountAlice: PublicProfileStruct = {
  id,
  createdByAccount: id,
  createdAtBlock: 456,
  createdAtTime: new Date().getTime(),

  followersCount: 137,
  followingSpacesCount: 15,
  followingAccountsCount: 23,
  reputation: 100,

  hasProfile: true,
}

export const mockProfileAlice = {} as Profile

export const mockContentAlice: ProfileContent = {
  about: 'About of w3f',
  name: 'Web 3 foundation',
  avatar: aliceAvatarData,
}

export const mockProfileDataAlice = {
  id,
  struct: mockSocialAccountAlice,
  content: mockContentAlice,
} as ProfileData
