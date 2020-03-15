
import React from 'react';
import dynamic from 'next/dynamic';
const EditBlog = dynamic(() => import('../../../components/blogs/EditBlog').then((mod: any) => mod.EditBlog), { ssr: false });

export default () => <EditBlog />;
