# Changelog

## M3

### SEO optimizations

It’s essential for any blogging platform or a social network to be indexed by the search engines so other people could find your blogs or posts through a web search.

- Integration with Next.js for server-side rendering of read-only parts: view blog, post, comment, and public user’s profile.
- Server-side rendering of a blog.
- Server-side rendering of a post.
- Server-side rendering of every comment.
- Server-side rendering of a user profile. (Profiles should be optional)

### Full-text search

Currently, it’s hard to build a full-text search service in a decentralized way because we don’t have a proper incentivization model for technology that is not built on blockchain (as a full-text search is). That's why we will implement it as a centralized service built on the open-source technology: [ElasticSearch](https://www.elastic.co/).

- Full-text search for blogs.
- Full-text search for posts.

## M2

### Rating and reputation

- Update a comment rating after the comment upvoted/downvoted.
- Update a post rating after it has been upvoted/downvoted.
- Update a blog rating after its post has been upvoted/downvoted.
- Update an account/member reputation after their post/comment upvoted/downvoted.

### Activity stream

- Follow an account.
- List blogs you follow.
- List accounts you follow.
- List account followers.
- Render an activity stream based on the blogs you follow.
- Render an activity stream based on the accounts you follow.
- Share a post with your followers (the post will be included in their activity stream).

## M1

### IPFS integration

Currently we store all text content onchain. And in this milestone we want to refactor Subsocial module to store text content of blogs, posts and comments on IPFS.

- Store blogs on IPFS (name, description, cover image, etc.).
- Store posts on IPFS (title, body, summary, tags, cover image, publishing date, etc.)
- Store comments on IPFS.
- Store public member profiles on IPFS (username, avatar, about, links to other social networks).

### Edit history

Store an edit history on IPFS + list of CIDs in Substrate storage in a corresponding struct: blog, post, comment or profile.

- Save and view an edit history of a post.
- Save and view an edit history of a blog.
- Save and view an edit history of a comment.
- Save and view an edit history of a member profile.
