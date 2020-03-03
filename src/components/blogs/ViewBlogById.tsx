import React from 'react';

import { ViewBlog } from './ViewBlog';
import { BlogId } from '../types';
import { useRouter } from 'next/router';
import { registry } from '@polkadot/react-api';

const Component = () => {
  const router = useRouter();
  const { blogId } = router.query;
  return blogId
    ? <ViewBlog id={new BlogId(registry, blogId as string)} />
    : null;
};

export default Component
