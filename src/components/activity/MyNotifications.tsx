import { useMyAddress } from "../auth/MyAccountContext"
import NotAuthorized from "../auth/NotAuthorized"
import HeadMeta from "../utils/HeadMeta"
import { Notifications } from "./Notifications"

const NOTIFICATION_TITLE = 'My notifications'

export const MyNotifications = () => {
  const myAddress = useMyAddress()

  if (!myAddress) return <NotAuthorized />

  return <>
    <HeadMeta title={NOTIFICATION_TITLE} />
    <Notifications title={NOTIFICATION_TITLE} address={myAddress} />
  </>
}

export default MyNotifications
