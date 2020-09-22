import dynamic from 'next/dynamic';
const NewProfile = dynamic(() => import('../../components/profiles/EditProfile').then((mod: any) => mod.NewProfile), { ssr: false });

export default NewProfile;
