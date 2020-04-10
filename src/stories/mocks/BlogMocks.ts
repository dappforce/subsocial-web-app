import { mockNavTabs } from './NavTabsMocks'
import U32 from '@polkadot/types/primitive/U32'
import { registry } from '@polkadot/react-api'
import BN from 'bn.js'
import { i32, Option, u16, u32 } from '@polkadot/types'
import { BlogContent } from '@subsocial/types/offchain'
import { AccountId, BlockNumber, Moment } from '@subsocial/types/substrate/interfaces/runtime'
import { Blog, BlogId, IpfsHash, WhoAndWhen } from '@subsocial/types/substrate/interfaces'
import { BlogData } from '../../components/blogs/ViewBlog'
import {mockAccountAlice, mockAccountBob} from './AccountMocks'
import { Vec } from '@polkadot/types/codec';
import { BlogHistoryRecord } from '@subsocial/types/substrate/interfaces/subsocial/types';

type NewBlogProps = {
  id?: number | BN,
  account?: AccountId,
  writers?: AccountId[],
  handle?: string,
  ipfs_hash?: string,
  posts_count?: number,
  followers_count?: number,
  edit_history?: BlogHistoryRecord[],
  score?: number
}

let _id = 0
const nextId = (): BlogId => new BN(++_id) as BlogId

function newBlogStructMock ({
  id = nextId(),
  account = mockAccountAlice,
  writers = [],
  handle,
  ipfs_hash = '',
  posts_count = 12,
  followers_count = 3456,
  edit_history = [],
  score = 678
}: NewBlogProps): Blog {
  return {
    id: new BN(id) as BlogId,
    created: {
      account,
      block: new BN(12345) as BlockNumber,
      time: new BN(1586523823996) as Moment
    } as WhoAndWhen,
    updated: new Option(registry, 'Null', null),
    writers: writers as unknown as Vec<AccountId>,
    handle: new Option(registry, 'Text', handle),
    ipfs_hash: ipfs_hash as unknown as IpfsHash,
    posts_count: new BN(posts_count) as u16,
    followers_count: new BN(followers_count) as u32,
    edit_history: edit_history as unknown as Vec<BlogHistoryRecord>,
    score: new BN(score) as i32
  } as Blog
}

export const mockBlogId = new BN(99);

export const mockBlogStruct = newBlogStructMock({
  account: mockAccountAlice,
  handle: 'alice_in_chains',
  posts_count: 12,
  followers_count: 4561,
  score: 654
})

export const mockBlogStructBob = newBlogStructMock({
  account: mockAccountBob,
  handle: 'bobster',
  posts_count: 0,
  followers_count: 43,
  score: 1
})

export const mockBlogJson: BlogContent = {
  name: 'Alice in Chains',
  desc: 'Alice in Chains is an American rock band from Seattle, Washington, formed in 1987 by guitarist and vocalist Jerry Cantrell and drummer Sean Kinney, who later recruited bassist Mike Starr and lead vocalist Layne Staley. Starr was replaced by Mike Inez in 1993.',
  image: 'https://i.pinimg.com/originals/d1/dd/32/d1dd322177b1edf654be68644d427e74.jpg',
  tags: [ 'bitcoin', 'ethereum', 'polkadot' ],
  navTabs: mockNavTabs
}

export const mockBlogJsonBob: BlogContent = {
  name: 'The Best Blog You Can Ever Find on the Internet',
  desc: 'In 2000 I set up a dot com web site called "the very best site ever" and on it carried pictures and descriptions of our worldwide holidays and our lives closer to home. However, I have learned that the webhosts have "lost" it. Time has moved on and it is being replaced by this blog!',
  image: 'https://1.bp.blogspot.com/-JGn_YzUSXZI/Xl0sWyutEJI/AAAAAAAAU2M/QS54o3oDNJs5dMiYPnOUCXRT6UkyeFsVgCLcBGAsYHQ/s320/200113%2B%252839%2529.jpg',
  tags: [],
  navTabs: mockNavTabs
}

export const mockBlogValidation = {
  handleMinLen: new U32(registry, 5),
  handleMaxLen: new U32(registry, 50),
  blogMaxLen: 500
}

export const mockBlogDataAlice = {
  blog: mockBlogStruct,
  initialContent: mockBlogJson
}

export const mockBlogDataBob = {
  blog: mockBlogStructBob,
  initialContent: mockBlogJsonBob
}

export const mockBlogsData: BlogData[] = [
  mockBlogDataAlice,
  mockBlogDataBob
]
