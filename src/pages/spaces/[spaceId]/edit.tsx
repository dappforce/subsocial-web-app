
import React from 'react';
import dynamic from 'next/dynamic';
const EditSpace = dynamic(() => import('../../../components/spaces/EditSpace').then((mod: any) => mod.EditSpace), { ssr: false });

export default () => <EditSpace />;
