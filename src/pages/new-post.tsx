
import React from 'react';
import dynamic from 'next/dynamic';
const NewPost = dynamic(() => import('../components/posts/EditPost').then((mod: any) => mod.NewPost), { ssr: false });

import Page from '../layout/Page';

export default () => <Page title='Create post'><NewPost/></Page>;
