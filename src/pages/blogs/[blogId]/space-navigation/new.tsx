import React from 'react';
import dynamic from 'next/dynamic';
const NewNavigation = dynamic(() => import('../../../../components/blogs/NavigationEditor'), { ssr: false });

export default () => <NewNavigation />;
