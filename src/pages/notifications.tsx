import dynamic from 'next/dynamic';
const MyNotifications = dynamic(() => import('../components/activity/MyNotifications'), { ssr: false });

export default MyNotifications;
