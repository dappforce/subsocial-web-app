import React from 'react';
import dynamic from 'next/dynamic';
const Home = dynamic(() => import('../components/activity/HomePage'), { ssr: false });
import Page from '../layout/Page';

export default () => <Page title='Home'><Home/></Page>;
