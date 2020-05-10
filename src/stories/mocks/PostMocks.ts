import { mockBlogId } from './BlogMocks';
import U32 from '@polkadot/types/primitive/U32';
import { registry } from '@subsocial/react-api';
import { BlogId, Post } from '@subsocial/types/substrate/interfaces';
import { PostContent } from '@subsocial/types/offchain';
import BN from 'bn.js'
import { mockAccountAlice } from './AccountMocks';

let _id = 200
const nextId = (): BlogId => new BN(++_id) as BlogId

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
  blog_id: mockBlogId
} as unknown as Post

export const mockPostJson: PostContent = {
  title: 'Example post',
  body: 'The most interesting content ever.',
  image: '',
  tags: [ 'bitcoin', 'ethereum', 'polkadot' ],
  canonical: 'http://example.com'
}
