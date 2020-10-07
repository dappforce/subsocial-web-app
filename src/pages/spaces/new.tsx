import dynamic from 'next/dynamic';
const NewSpace = dynamic(() => import('../../components/spaces/EditSpace'), { ssr: false });

export const page = () => <NewSpace />
export default page
