
import React from 'react';
import dynamic from 'next/dynamic';
const NewSpace = dynamic(() => import('../../components/spaces/EditSpace'), { ssr: false });

export default () => <NewSpace />;
