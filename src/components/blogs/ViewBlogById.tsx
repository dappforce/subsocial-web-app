import React from 'react';

import { ViewBlog } from './ViewBlog';
import { BlogId } from '../types';
import { useRouter } from 'next/router';
import { getApi } from '../utils/utils';

const Component = () => {
  const router = useRouter();
  const { blogId } = router.query;

  const idOrSlug = blogId as string

  return blogId
    ? <ViewBlog id={getId(idOrSlug)} />
    : null;
};

const getId = async(idOrSlug: string) => {
  try {
    let id:BlogId;

    const api = await getApi();
  
    if (idOrSlug.startsWith('@')) {
      const slug = idOrSlug.substring(1)
      id = await api.query.blogs.blogIdBySlug(slug) as unknown as BlogId;
    } else {
      const blogId = idOrSlug
      id = new BlogId(blogId as string)
    }
  
    return id
  } catch (err) {
    console.log(err)
  }
  
}

export default Component
