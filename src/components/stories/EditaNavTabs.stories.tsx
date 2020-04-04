import React from 'react';
import '../utils/styles/subsocial.css';
import { withStorybookContext } from './withStorybookContext';
import { NavigationEditor } from '../blogs/NavigationEditor';
import { BlogId, Blog, BlogContent } from '../types';

export default {
  title: 'Blogs | Navigation Editor',
  decorators: [ withStorybookContext ]
};

const mockBlogId = new BlogId(99);

const mockStruct = {
  id: mockBlogId,
  slug: 'best_blog'
} as unknown as Blog

const mockJson: BlogContent = {
  name: 'Super Cool Blog',
  desc: 'This is the best blog ever ;)',
  image: 'http://pawspetphotography.co.uk/files/cache/3968d3076dc0f864acf621fef3faae17_f902.jpg',
  tags: [ 'bitcoin', 'ethereum', 'polkadot' ],
  navTabs: [
    { id: 1, title: 'Posts by tags', type: 'by-tag', description: '', content: { data: [ 'crypto', 'coin' ] }, hidden: false },
    { id: 2, title: 'Search Internet', type: 'url', description: 'DuckDuckGo is an internet search engine that emphasizes protecting searchers privacy and avoiding the filter bubble of personalized search results.', content: { data: 'https://duckduckgo.com/' }, hidden: true },
    { id: 3, title: 'Wikipedia', type: 'url', description: 'Wikipedia is a multilingual online encyclopedia created and maintained as an open collaboration project by a community of volunteer editors using a wiki-based editing system.', content: { data: 'https://www.wikipedia.org/' }, hidden: false },
    { id: 4, title: 'Example Site', type: 'url', description: '', content: { data: 'example.com' }, hidden: false },
    { id: 5, title: 'Q & A', type: 'by-tag', description: '', content: { data: [ 'question', 'answer', 'help', 'qna' ] }, hidden: false }
  ]
}

export const EditNavigation = () =>
  <NavigationEditor id={mockBlogId} struct={mockStruct} json={mockJson} />
