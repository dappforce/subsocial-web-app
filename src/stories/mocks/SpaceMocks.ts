import { mockNavTabs } from './NavTabsMocks'
import U32 from '@polkadot/types/primitive/U32'
import { registry } from '@subsocial/types/substrate/registry'
import { SpaceContent } from '@subsocial/types/offchain'
import { mockAccountAlice, mockAccountBob } from './AccountMocks'
import { AccountId, SpaceId, SpaceData, SpaceStruct } from 'src/types'
import { subsocialSpaceCid } from './cids'

type NewSpaceProps = {
  id?: SpaceId,
  ownerId?: AccountId,
  handle?: string,
  hidden?: boolean,
  postsCount?: number,
  followersCount?: number,
  score?: number
}

let _id = 10
const nextId = (): SpaceId => `${++_id}`

function newSpaceStructMock ({
  id = nextId(),
  ownerId = mockAccountAlice.toString(),
  handle,
  hidden = false,
  postsCount = 12,
  followersCount = 3456,
  score = 678
}: NewSpaceProps): SpaceStruct {

  const hiddenPostsCount = postsCount > 2 ? 2 : 0

  return {
    id,
    createdByAccount: ownerId,
    createdAtBlock: 12345,
    createdAtTime: new Date().getTime(),

    ownerId,
    handle,
    contentId: subsocialSpaceCid,
    hidden,

    postsCount,
    hiddenPostsCount,
    visiblePostsCount: postsCount - hiddenPostsCount,

    followersCount,
    score
  }
}

export const mockSpaceId = nextId()

export const mockSpaceStruct = newSpaceStructMock({
  ownerId: mockAccountAlice.toString(),
  handle: 'alice_in_chains',
  postsCount: 12,
  followersCount: 4561,
  score: 654
})

export const mockSpaceStructBob = newSpaceStructMock({
  ownerId: mockAccountBob.toString(),
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

export const mockSpaceDataAlice: SpaceData = {
  id: mockSpaceStruct.id,
  struct: mockSpaceStruct,
  content: mockSpaceJson
}

export const mockSpaceDataBob: SpaceData = {
  id: mockSpaceStructBob.id,
  struct: mockSpaceStructBob,
  content: mockSpaceJsonBob
}

export const mockSpacesData: SpaceData[] = [
  mockSpaceDataAlice,
  mockSpaceDataBob
]
