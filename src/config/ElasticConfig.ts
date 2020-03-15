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
    name: 'blog_name',
    desc: 'blog_desc'
  },
  post: {
    title: 'post_title',
    body: 'post_body'
  },
  comment: {
    body: 'comment_body'
  },
  profile: {
    username: 'profile_username',
    fullname: 'profile_fullname',
    about: 'profile_about'
  }
}
