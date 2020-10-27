import { KusamaBareProps } from "./types"
import { useKusamaIdentity } from "./utils"
import { CheckCircleFilled } from "@ant-design/icons"
import msg from 'src/messages'
import styles from './index.module.sass'

const KusamaVerifyIcon = <CheckCircleFilled className={styles.VerifiedIcon} />

export const KusamaVerify = ({ address }: KusamaBareProps) => {
  const identity = useKusamaIdentity(address)

  return (identity?.isVerifySignIn
      && KusamaVerifyIcon)
      || null
}

export const KusamaTitle = ({ address }: KusamaBareProps) => {
  const identity = useKusamaIdentity(address)

  const title = identity?.isVerifySignIn
    ? <>
      {KusamaVerifyIcon}
      {msg.kusama.verifiedIdentity}
    </>
    : msg.kusama.unverifiedIdetity

  return <span>{title}</span>
}
