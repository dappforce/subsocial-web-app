import dynamic from 'next/dynamic';
const Notifications = dynamic(() => import('../components/activity/ListNotifications'), { ssr: false });

export default Notifications;
