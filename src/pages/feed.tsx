import dynamic from 'next/dynamic'
import { uiShowFeed } from 'src/components/utils/env'
import { PageNotFound } from 'src/components/utils'
const MyFeed = dynamic(() => import('../components/activity/MyFeed'), { ssr: false })

export const page = () => <MyFeed />

export default uiShowFeed ? page : PageNotFound
