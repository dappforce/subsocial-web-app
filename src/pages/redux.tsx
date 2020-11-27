import dynamic from 'next/dynamic'

const page = dynamic(() => import('../rtk/features/spaces/SpacesListRedux'), { ssr: false })

export default page
