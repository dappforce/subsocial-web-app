import dynamic from 'next/dynamic';
import { NextPage } from 'next';
import { uiShowNotifications } from 'src/components/utils/env';
import { PageNotFound } from 'src/components/utils';
const MyNotifications: NextPage<{}> = dynamic(() => import('../components/activity/MyNotifications'), { ssr: false });

export default uiShowNotifications ? MyNotifications : PageNotFound


