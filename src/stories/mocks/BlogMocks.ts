import { BlogId, Blog, BlogContent } from '../../components/types';
import { mockNavTabs } from './NavTabsMocks';
import { U32 } from '@polkadot/types';

export const mockBlogId = new BlogId(99);

export const mockBlogStruct: Blog = {
  id: mockBlogId,
  slug: 'alice_in_chains'
} as unknown as Blog

export const mockBlogJson: BlogContent = {
  name: 'Alice in Chains',
  desc: 'Alice in Chains is an American rock band from Seattle, Washington, formed in 1987 by guitarist and vocalist Jerry Cantrell and drummer Sean Kinney, who later recruited bassist Mike Starr and lead vocalist Layne Staley. Starr was replaced by Mike Inez in 1993.',
  image: 'https://i.pinimg.com/originals/d1/dd/32/d1dd322177b1edf654be68644d427e74.jpg',
  tags: [ 'bitcoin', 'ethereum', 'polkadot' ],
  navTabs: mockNavTabs
}

export const mockBlogValidation = {
  slugMinLen: new U32(5),
  slugMaxLen: new U32(50),
  blogMaxLen: new U32(500)
}
