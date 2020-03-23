import React from 'react';
import dynamic from 'next/dynamic';
const EditNavigation = dynamic(() => import('../../../../components/blogs/NavigationEditor').then((mod: any) => mod.EditNavigation), { ssr: false });

export default () => <EditNavigation />;
