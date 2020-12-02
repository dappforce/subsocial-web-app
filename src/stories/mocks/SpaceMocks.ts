import { mockNavTabs } from './NavTabsMocks'
import U32 from '@polkadot/types/primitive/U32'
import { registry } from '@subsocial/types/substrate/registry'
import BN from 'bn.js'
import { i32, u16, u32, Null } from '@polkadot/types'
import { SpaceContent } from '@subsocial/types/offchain'
import { Space, SpaceId, WhoAndWhen } from '@subsocial/types/substrate/interfaces'
import { mockAccountAlice, mockAccountBob } from './AccountMocks'
import { SpaceData } from 'src/types'
import { Content, IpfsContent, OptionText, OptionId } from '@subsocial/types/substrate/classes'
import AccountId from '@polkadot/types/generic/AccountId'
import { Moment, BlockNumber } from '@polkadot/types/interfaces'

type NewSpaceProps = {
  id?: number | BN,
  ownerId?: AccountId,
  handle?: string,
  content?: Content,
  postsCount?: number,
  followersCount?: number,
  score?: number
}

let _id = 10
const nextId = (): SpaceId => new BN(++_id) as SpaceId

function newSpaceStructMock ({
  id = nextId(),
  ownerId = mockAccountAlice,
  handle,
  content = new IpfsContent(),
  postsCount = 12,
  followersCount = 3456,
  score = 678
}: NewSpaceProps): Space {
  return {
    id: new BN(id) as SpaceId,
    created: {
      account,
      block: new BN(12345) as BlockNumber,
      time: new BN(1586523823996) as Moment
    } as WhoAndWhen,
    updated: new Null(registry),
    parent_id: new OptionId(),
    owner: ownerId,
    handle: new OptionText(handle),
    content: content,
    posts_count: new BN(postsCount) as u16,
    followers_count: new BN(followersCount) as u32,
    score: new BN(score) as i32
  } as any as Space // TODO remove any
}

export const mockSpaceId = nextId()

export const mockSpaceStruct = newSpaceStructMock({
  ownerId: mockAccountAlice,
  handle: 'alice_in_chains',
  postsCount: 12,
  followersCount: 4561,
  score: 654
})

export const mockSpaceStructBob = newSpaceStructMock({
  ownerId: mockAccountBob,
  handle: 'bobster',
  postsCount: 0,
  followersCount: 43,
  score: 1
})

export const mockSpaceJson: SpaceContent = {
  name: 'Alice in Chains',
  about: 'Alice in Chains is an American rock band from Seattle, Washington, formed in 1987 by guitarist and vocalist Jerry Cantrell and drummer Sean Kinney, who later recruited bassist Mike Starr and lead vocalist Layne Staley. Starr was replaced by Mike Inez in 1993.',
  image: 'https://i.pinimg.com/originals/d1/dd/32/d1dd322177b1edf654be68644d427e74.jpg',
  tags: [ 'bitcoin', 'ethereum', 'polkadot' ],
  email: '',
  links: [],
  navTabs: mockNavTabs
}

export const mockSpaceJsonBob: SpaceContent = {
  name: 'The Best Space You Can Ever Find on the Internet',
  about: 'In 2000 I set up a dot com web site called "the very best site ever" and on it carried pictures and descriptions of our worldwide holidays and our lives closer to home. However, I have learned that the webhosts have "lost" it. Time has moved on and it is being replaced by this space!',
  image: '',
  tags: [],
  email: '',
  links: [],
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
