// Copyright 2017-2019 @polkadot/apps authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import dynamic from 'next/dynamic';
const EditPost = dynamic(() => import('../components/posts/EditPost').then((mod: any) => mod.EditPost), { ssr: false });

import Page from '../layout/Page';

export default () => <Page title='Edit post'><EditPost/></Page>;
