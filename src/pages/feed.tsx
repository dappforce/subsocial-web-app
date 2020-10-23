import dynamic from 'next/dynamic';
const MyFeed = dynamic(() => import('../components/activity/MyFeed'), { ssr: false });

export const page = () => <MyFeed title={'My feed'} />
export default page
