export const ElasticNodeURL = 'http://localhost:9200';

export const ElasticIndex = {
  profiles: 'subsocial_profiles',
  blogs: 'subsocial_blogs',
  posts: 'subsocial_posts',
  // comments: 'subsocial_comments'
};

export const AllElasticIndexes = [
  ElasticIndex.profiles,
  ElasticIndex.blogs,
  ElasticIndex.posts
];