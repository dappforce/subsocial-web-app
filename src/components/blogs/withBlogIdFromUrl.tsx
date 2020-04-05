import React from 'react';
import { useRouter } from 'next/router';
import { BlogId } from '../types';

export function withBlogIdFromUrl<Props = { id: BlogId }>
  (Component: React.ComponentType<Props>) {

  return function (props: Props) {
    const router = useRouter();
    const { blogId } = router.query;
    try {
      return <Component id={new BlogId(blogId as string)} {...props} />;
    } catch (err) {
      return <em>Invalid blog ID: {blogId}</em>;
    }
  };
}
