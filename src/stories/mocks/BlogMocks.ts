import { mockNavTabs } from './NavTabsMocks'
import U32 from '@polkadot/types/primitive/U32'
import { registry } from '@polkadot/react-api'
import BN from 'bn.js'
import { i32, Option, u16, u32 } from '@polkadot/types'
import { BlogContent } from '@subsocial/types/offchain'
import { AccountId, BlockNumber, Moment } from '@subsocial/types/substrate/interfaces/runtime'
import { Blog, BlogId, IpfsHash, WhoAndWhen } from '@subsocial/types/substrate/interfaces'
import { BlogData } from '../../components/blogs/ViewBlog'
import { mockAccountAlice } from './AccountMocks'
import { Vec } from '@polkadot/types/codec';
import { BlogHistoryRecord } from '@subsocial/types/substrate/interfaces/subsocial/types';

export const mockBlogId = new BN(99);

const mockCreated: WhoAndWhen = {
  account: mockAccountAlice,
  block: new BN(12345) as BlockNumber,
  time: new BN(1586523823996) as Moment
} as WhoAndWhen

export const mockBlogStruct: Blog = {
  id: mockBlogId as BlogId,
  created: mockCreated,
  updated: new Option(registry, 'Null', null),
  writers: [] as unknown as Vec<AccountId>,
  handle: new Option(registry, 'Text', 'alice_in_chains'),
  ipfs_hash: '' as unknown as IpfsHash,
  posts_count: new BN(12) as u16,
  followers_count: new BN(4561) as u32,
  edit_history: [] as unknown as Vec<BlogHistoryRecord>,
  score: new BN(654) as i32
} as Blog

export const mockBlogJson: BlogContent = {
  name: 'Alice in Chains',
  desc: 'Alice in Chains is an American rock band from Seattle, Washington, formed in 1987 by guitarist and vocalist Jerry Cantrell and drummer Sean Kinney, who later recruited bassist Mike Starr and lead vocalist Layne Staley. Starr was replaced by Mike Inez in 1993.',
  image: 'https://i.pinimg.com/originals/d1/dd/32/d1dd322177b1edf654be68644d427e74.jpg',
  tags: [ 'bitcoin', 'ethereum', 'polkadot' ],
  navTabs: mockNavTabs
}

export const mockBlogValidation = {
  handleMinLen: new U32(registry, 5),
  handleMaxLen: new U32(registry, 50),
  blogMaxLen: 500
}

export const mockBlogsData: BlogData[] = [
  {
    blog: mockBlogStruct,
    initialContent: mockBlogJson
  }
]
