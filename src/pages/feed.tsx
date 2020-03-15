import dynamic from 'next/dynamic';
const Feeds = dynamic(() => import('../components/activity/ListFeeds'), { ssr: false });

export default Feeds;
