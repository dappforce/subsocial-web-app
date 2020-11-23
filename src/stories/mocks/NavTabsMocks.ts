import { NavTab } from '@subsocial/types/offchain'

export const mockNavTabs: NavTab[] = [
  {
    id: 1,
    hidden: false,
    title: 'Posts by tags',
    type: 'by-tag',
    description: '',
    content: {
      data: [ 'crypto', 'coin' ]
    }
  }, {
    id: 2,
    hidden: true,
    title: 'Search Internet',
    type: 'url',
    description: 'DuckDuckGo is an internet search engine that emphasizes protecting searchers privacy and avoiding the filter bubble of personalized search results.',
    content: {
      data: 'https://duckduckgo.com/'
    }
  }, {
    id: 3,
    hidden: false,
    title: 'Wikipedia',
    type: 'url',
    description: 'Wikipedia is a multilingual online encyclopedia created and maintained as an open collaboration project by a community of volunteer editors using a wiki-based editing system.',
    content: {
      data: 'https://www.wikipedia.org/'
    }
  }, {
    id: 4,
    hidden: false,
    title: 'Example Site',
    type: 'url',
    description: '',
    content: {
      data: 'example.com'
    }
  }, {
    id: 5,
    hidden: false,
    title: 'Q & A',
    type: 'by-tag',
    description: '',
    content: {
      data: [ 'question', 'answer', 'help', 'qna' ]
    }
  }
]
