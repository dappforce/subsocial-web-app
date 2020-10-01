import dynamic from 'next/dynamic';
const NewPost = dynamic(() => import('../../../components/posts/EditPost').then((mod: any) => mod.NewPost), { ssr: false });

export const page = () => <NewPost />
export default page
