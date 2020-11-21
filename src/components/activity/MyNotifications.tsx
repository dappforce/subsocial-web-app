import { useMyAddress } from '../auth/MyAccountContext'
import NotAuthorized from '../auth/NotAuthorized'
import { PageContent } from '../main/PageWrapper'
import { Notifications } from './Notifications'

const NOTIFICATION_TITLE = 'My notifications'

export const MyNotifications = () => {
  const myAddress = useMyAddress()

  if (!myAddress) return <NotAuthorized />

  return <PageContent meta={{ title: NOTIFICATION_TITLE }}>
    <Notifications title={NOTIFICATION_TITLE} address={myAddress} />
  </PageContent>
}

export default MyNotifications
