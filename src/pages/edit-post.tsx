
import React from 'react';
import dynamic from 'next/dynamic';
const EditPost = dynamic(() => import('../components/posts/EditPost').then((mod: any) => mod.EditPost), { ssr: false });

import Page from '../layout/Page';

export default () => <Page title='Edit post'><EditPost/></Page>;
