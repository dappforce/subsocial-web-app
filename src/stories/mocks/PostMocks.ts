import { mockSpaceId } from './SpaceMocks'
import U32 from '@polkadot/types/primitive/U32'
import { registry } from '@subsocial/types/substrate/registry'
import { SpaceId, Post } from '@subsocial/types/substrate/interfaces'
import { PostContent } from '@subsocial/types/offchain'
import BN from 'bn.js'
import { mockAccountAlice } from './AccountMocks'

let _id = 200
const nextId = (): SpaceId => new BN(++_id) as SpaceId

export const mockPostId = nextId()

export const mockPostValidation = {
  postMaxLen: new U32(registry, 2000)
}

export const mockPostStruct = {
  id: new BN(34),
  created: {
    account: mockAccountAlice,
    time: new Date().getSeconds()
  },
  space_id: mockSpaceId
} as unknown as Post

export const mockPostJson: PostContent = {
  title: 'Example post',
  body: 'The most interesting content ever.',
  image: '',
  tags: [ 'bitcoin', 'ethereum', 'polkadot' ],
  canonical: 'http://example.com'
}
