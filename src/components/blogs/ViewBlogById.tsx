import React from 'react';

import { ViewBlog } from './ViewBlog';
import { useRouter } from 'next/router';
import BN from 'bn.js';

const Component = () => {
  const router = useRouter();
  const { blogId } = router.query;
  return blogId
    ? <ViewBlog id={new BN(blogId as string)} />
    : null;
};

export default Component
