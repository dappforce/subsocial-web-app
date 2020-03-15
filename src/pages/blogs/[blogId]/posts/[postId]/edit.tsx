
import React from 'react';
import dynamic from 'next/dynamic';
const EditPost = dynamic(() => import('../../../../../components/posts/EditPost').then((mod: any) => mod.EditPost), { ssr: false });

export default () => <EditPost />;
