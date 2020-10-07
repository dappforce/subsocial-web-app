export type ElasticIndexTypes = 'spaces' | 'posts' | 'profiles';

export const ElasticIndex = {
  profiles: 'subsocial_profiles',
  spaces: 'subsocial_spaces',
  posts: 'subsocial_posts'
};

export const AllElasticIndexes = [
  ElasticIndex.profiles,
  ElasticIndex.spaces,
  ElasticIndex.posts
];

export const ElasticFields = {
  space: {
    name: 'name',
    handle: 'handle',
    about: 'about',
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
    name: 'name',
    about: 'about'
  }
}
