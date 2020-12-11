import dynamic from 'next/dynamic'
const NewProfile = dynamic(() => import('../../components/profiles/EditProfile').then((mod: any) => mod.NewProfile), { ssr: false })

export const page = () => <NewProfile />
export default page
