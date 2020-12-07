import dynamic from 'next/dynamic'
import { uiShowNotifications } from 'src/components/utils/env'
import { PageNotFound } from 'src/components/utils'
const MyNotifications = dynamic(() => import('../components/activity/MyNotifications'), { ssr: false })

export const page = () => <MyNotifications />

export default uiShowNotifications ? page : PageNotFound


