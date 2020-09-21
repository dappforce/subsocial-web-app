import dynamic from 'next/dynamic';
const EditProfile = dynamic(() => import('../../components/profiles/EditProfile').then((mod: any) => mod.EditProfile), { ssr: false });

export const page = () => <EditProfile />
export default page
