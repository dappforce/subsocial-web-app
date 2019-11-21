
import React from 'react';
import dynamic from 'next/dynamic';
const Feeds = dynamic(() => import('../components/activity/ListFeeds'), { ssr: false });
import Page from '../layout/Page';

export default () => <Page title='Feeds'><Feeds/></Page>;
