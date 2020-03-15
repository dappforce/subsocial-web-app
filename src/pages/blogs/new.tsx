
import React from 'react';
import dynamic from 'next/dynamic';
const NewBlog = dynamic(() => import('../../components/blogs/EditBlog'), { ssr: false });

export default () => <NewBlog />;
