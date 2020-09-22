import dynamic from 'next/dynamic';
const EditNavigation = dynamic(() => import('../../../../components/spaces/NavigationEditor').then((mod: any) => mod.EditNavigation), { ssr: false });

export const page = () => <EditNavigation />
export default page
