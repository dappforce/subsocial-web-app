
import React from 'react';
import dynamic from 'next/dynamic';
const NewBlog = dynamic(() => import('../../components/blogs/EditBlog'), { ssr: false });

import Page from '../../layout/Page';

export default () => <Page title='Create blog'><NewBlog/></Page>;
