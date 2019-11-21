
import React from 'react';
import dynamic from 'next/dynamic';
const Notifications = dynamic(() => import('../components/activity/ListNotifications'), { ssr: false });

import Page from '../layout/Page';

export default () => <Page title='Notifications'><Notifications/></Page>;
