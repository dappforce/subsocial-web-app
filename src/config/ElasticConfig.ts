import { getEnv } from '../components/utils/utils';

export const ElasticNodeURL = getEnv('ELASTIC_URL') || 'http://localhost:9200';

export type ElasticIndexTypes = 'blogs' | 'posts' | 'profiles';

export const ElasticIndex = {
  profiles: 'subsocial_profiles',
  blogs: 'subsocial_blogs',
  posts: 'subsocial_posts'
  // comments: 'subsocial_comments'
};

export const AllElasticIndexes = [
  ElasticIndex.profiles,
  ElasticIndex.blogs,
  ElasticIndex.posts
];

export const ElasticFields = {
  blog: {
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
    username: 'username',
    fullname: 'fullname',
    about: 'about'
  }
}
