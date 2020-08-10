export type ElasticIndexTypes = 'spaces' | 'posts' | 'profiles';

export const ElasticIndex = {
  profiles: 'subsocial_profiles',
  spaces: 'subsocial_spaces',
  posts: 'subsocial_posts'
  // comments: 'subsocial_comments'
};

export const AllElasticIndexes = [
  ElasticIndex.profiles,
  ElasticIndex.spaces,
  ElasticIndex.posts
];

export const ElasticFields = {
  space: {
    name: 'name',
    desc: 'desc',
    tags: 'tags'
  },
  post: {
    title: 'title',
    body: 'body',
    tags: 'tags'
  },
  comment: {
    body: 'body'
  },
  profile: {
    handle: 'handle',
    fullname: 'fullname',
    about: 'about'
  }
}
