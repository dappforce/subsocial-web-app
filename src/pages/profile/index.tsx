import dynamic from 'next/dynamic';
const ViewMyProfile = dynamic(() => import('../../components/profiles/ViewProfile').then((mod: any) => mod.ViewMyProfile), { ssr: false });

export default ViewMyProfile;
