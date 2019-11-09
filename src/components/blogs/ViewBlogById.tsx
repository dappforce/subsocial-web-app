import React from 'react';

import ViewBlog from './ViewBlog';
import { BlogId } from '../types';
import { useRouter } from 'next/router';

const Component = () => {
  const router = useRouter();
  const { id } = router.query;
  return id
  ? <ViewBlog id={new BlogId(id as string)} />
  : null;
};

export default Component;
