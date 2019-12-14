
import React from 'react';
import dynamic from 'next/dynamic';
const NewProfile = dynamic(() => import('../../components/profiles/EditProfile').then((mod: any) => mod.NewProfile), { ssr: false });

import Page from '../../layout/Page';

export default () => <Page title='Create profile'><NewProfile/></Page>;
