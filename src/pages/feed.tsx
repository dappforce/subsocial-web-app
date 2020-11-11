import dynamic from 'next/dynamic';
import { NextPage } from 'next';
import { uiShowFeed } from 'src/components/utils/env';
import { PageNotFound } from 'src/components/utils';
const MyFeed = dynamic(() => import('../components/activity/MyFeed'), { ssr: false });

export const Page: NextPage<{}> = () => <MyFeed title={'My feed'} />

export default uiShowFeed ? Page : PageNotFound
