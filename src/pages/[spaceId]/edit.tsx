import dynamic from 'next/dynamic';
const EditSpace = dynamic(() => import('../../components/spaces/EditSpace').then((mod: any) => mod.EditSpace), { ssr: false });

export const page = () => <EditSpace />
export default page
