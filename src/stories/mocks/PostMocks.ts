import { U32 } from '@polkadot/types';
import { Post, PostContent, PostId } from '../../components/types';
import { mockBlogId } from './BlogMocks';

export const mockPostId = new PostId(34)

export const mockPostValidation = {
  postMaxLen: new U32(2000)
}

export const mockPostStruct = {
  id: new PostId(34),
  blog_id: mockBlogId
} as unknown as Post

export const mockPostJson: PostContent = {
  title: 'Example post',
  body: 'The most interesting content ever.',
  image: '',
  tags: [ 'bitcoin', 'ethereum', 'polkadot' ],
  canonical: 'http://example.com'
}
