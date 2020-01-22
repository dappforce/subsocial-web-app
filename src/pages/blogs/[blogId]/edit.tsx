
import React from 'react';
import dynamic from 'next/dynamic';
const EditBlog = dynamic(() => import('../../../components/blogs/EditBlog').then((mod: any) => mod.EditBlog), { ssr: false });

import Page from '../../../layout/Page';

export default () => <Page title='Create blog'><EditBlog/></Page>;
