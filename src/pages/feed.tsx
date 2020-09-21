import dynamic from 'next/dynamic';
const MyFeed = dynamic(() => import('../components/activity/MyFeed'), { ssr: false });

export default () => <MyFeed withTitle />;
