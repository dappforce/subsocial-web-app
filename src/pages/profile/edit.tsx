
import React from 'react';
import dynamic from 'next/dynamic';
const EditProfile = dynamic(() => import('../../components/profiles/EditProfile').then((mod: any) => mod.EditProfile), { ssr: false });

import Page from '../../layout/Page';

export default () => <Page title='Create profile'><EditProfile/></Page>;
