import dynamic from 'next/dynamic';
const EditPost = dynamic(() => import('../../../components/posts/EditPost').then((mod: any) => mod.EditPost), { ssr: false });

export const page = () => <EditPost />
export default page
