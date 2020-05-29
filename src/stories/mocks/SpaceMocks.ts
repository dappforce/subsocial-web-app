import { mockNavTabs } from './NavTabsMocks'
import U32 from '@polkadot/types/primitive/U32'
import { registry } from '@subsocial/react-api'
import BN from 'bn.js'
import { i32, Option, u16, u32 } from '@polkadot/types'
import { SpaceContent } from '@subsocial/types/offchain'
import { AccountId, BlockNumber, Moment } from '@subsocial/types/substrate/interfaces/runtime'
import { Space, SpaceId, IpfsHash, WhoAndWhen } from '@subsocial/types/substrate/interfaces'
import { mockAccountAlice, mockAccountBob } from './AccountMocks'
import { Vec } from '@polkadot/types/codec';
import { SpaceHistoryRecord } from '@subsocial/types/substrate/interfaces/subsocial/types';
import { SpaceData } from '@subsocial/types/dto'

type NewSpaceProps = {
  id?: number | BN,
  account?: AccountId,
  writers?: AccountId[],
  handle?: string,
  ipfs_hash?: string,
  posts_count?: number,
  followers_count?: number,
  edit_history?: SpaceHistoryRecord[],
  score?: number
}

let _id = 10
const nextId = (): SpaceId => new BN(++_id) as SpaceId

function newSpaceStructMock ({
  id = nextId(),
  account = mockAccountAlice,
  writers = [],
  handle,
  ipfs_hash = '',
  posts_count = 12,
  followers_count = 3456,
  edit_history = [],
  score = 678
}: NewSpaceProps): Space {
  return {
    id: new BN(id) as SpaceId,
    created: {
      account,
      block: new BN(12345) as BlockNumber,
      time: new BN(1586523823996) as Moment
    } as WhoAndWhen,
    updated: new Option(registry, 'Null', null),
    owner: account,
    handle: new Option(registry, 'Text', handle),
    ipfs_hash: ipfs_hash as unknown as IpfsHash,
    posts_count: new BN(posts_count) as u16,
    followers_count: new BN(followers_count) as u32,
    edit_history: edit_history as unknown as Vec<SpaceHistoryRecord>,
    score: new BN(score) as i32
  } as Space
}

export const mockSpaceId = nextId()

export const mockSpaceStruct = newSpaceStructMock({
  account: mockAccountAlice,
  handle: 'alice_in_chains',
  posts_count: 12,
  followers_count: 4561,
  score: 654
})

export const mockSpaceStructBob = newSpaceStructMock({
  account: mockAccountBob,
  handle: 'bobster',
  posts_count: 0,
  followers_count: 43,
  score: 1
})

export const mockSpaceJson: SpaceContent = {
  name: 'Alice in Chains',
  desc: 'Alice in Chains is an American rock band from Seattle, Washington, formed in 1987 by guitarist and vocalist Jerry Cantrell and drummer Sean Kinney, who later recruited bassist Mike Starr and lead vocalist Layne Staley. Starr was replaced by Mike Inez in 1993.',
  image: 'https://i.pinimg.com/originals/d1/dd/32/d1dd322177b1edf654be68644d427e74.jpg',
  tags: [ 'bitcoin', 'ethereum', 'polkadot' ],
  navTabs: mockNavTabs
}

export const mockSpaceJsonBob: SpaceContent = {
  name: 'The Best Space You Can Ever Find on the Internet',
  desc: 'In 2000 I set up a dot com web site called "the very best site ever" and on it carried pictures and descriptions of our worldwide holidays and our lives closer to home. However, I have learned that the webhosts have "lost" it. Time has moved on and it is being replaced by this space!',
  image: '',
  tags: [],
  navTabs: mockNavTabs
}

export const mockSpaceValidation = {
  handleMinLen: new U32(registry, 5),
  handleMaxLen: new U32(registry, 50),
  spaceMaxLen: 500
}

export const mockSpaceDataAlice = {
  struct: mockSpaceStruct,
  content: mockSpaceJson
}

export const mockSpaceDataBob = {
  struct: mockSpaceStructBob,
  content: mockSpaceJsonBob
}

export const mockSpacesData: SpaceData[] = [
  mockSpaceDataAlice,
  mockSpaceDataBob
]
