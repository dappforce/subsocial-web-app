import { BlogId, Blog, BlogContent } from '../../components/types';
import { mockNavTabs } from './NavTabsMocks';
import { U32 } from '@polkadot/types';

export const mockBlogId = new BlogId(99);

export const mockBlogStruct: Blog = {
  id: mockBlogId,
  slug: 'best_blog'
} as unknown as Blog

export const mockBlogJson: BlogContent = {
  name: 'Super Cool Blog',
  desc: 'This is the best blog ever ;)',
  image: 'https://i.ytimg.com/vi/WXJ3cyeuhYU/hqdefault.jpgnigga',
  tags: [ 'bitcoin', 'ethereum', 'polkadot' ],
  navTabs: mockNavTabs
}

export const mockBlogValidation = {
  slugMinLen: new U32(5),
  slugMaxLen: new U32(50),
  blogMaxLen: new U32(500)
}
