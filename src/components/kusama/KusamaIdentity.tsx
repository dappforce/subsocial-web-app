import { Tooltip } from "antd"
import { DfBgImg } from "src/components/utils/DfBgImg"
import { isDef } from "@subsocial/utils"
import InfoSection, { InfoPanel } from "src/components/profiles/address-views/InfoSection"
import styles from './index.module.sass'
import { KusamaBareProps, KusamaInfo, identityInfoKeys } from "./types"
import { useKusamaIdentity, getKusamaItem } from "./utils"
import { KusamaTitle } from "./KusamaVerify"
import { startWithUpperCase } from "../utils"

type KusamaIdentityProps = KusamaBareProps & {
  title?: React.ReactNode
  size?: 'middle' | 'small' | 'default',
  column?: number,
  layout?: 'vertical' | 'horizontal',
  withTitle?: boolean,
  withSection?: boolean
}

export const KusamaIdentityTooltip = ({ address, ...props }: KusamaBareProps) => {
  const details = useKusamaIdentity(address)

  if (!details?.info) return null

  return <Tooltip
    {...props}
    placement="top"
    color='#fafafa'
    title={<InnerKusamaIdentity
      info={details.info}
      address={address}
      title={<KusamaTitle address={address} />}
      className={styles.TooltipKusamaIdentity}
      layout='horizontal'
      column={1}
    />}
  >
    <span className={`${styles.KusamaIcon} ${details.isVerifySignIn ? styles.verified : ''} `}>
      <DfBgImg src='/kusama-logo.svg' size={16} rounded/>
    </span>
  </Tooltip>
}

type InnerKusamaIdentityProps = KusamaIdentityProps & {
  info: KusamaInfo
}

export const InnerKusamaIdentity = ({ info, title = 'Kusama identity', withSection, withTitle = true, className, ...props }: InnerKusamaIdentityProps) => {

  const items = identityInfoKeys.map(key => ({
    label: key.replace(/(?:^\s*|\s+)(\S?)/g, (b) => b.toUpperCase()),
    value: getKusamaItem(key, info[key] || '')
  })).filter(x => isDef(x.value))

  const infoProps = {
    ...props,
    title: withTitle ? title : undefined,
    level: 3,
    items,
    className: `${styles.KusamaIdentitySection} ${className}`
  }

  return withSection ? <InfoSection {...infoProps} /> : <InfoPanel {...infoProps} />
}

export const KusamaIdentity = ({ address, withSection, withTitle = true, ...props }: KusamaIdentityProps) => {
  const details = useKusamaIdentity(address)

  if (!details) return null

  const { info } = details

  const items = identityInfoKeys.map(key => ({
    label: startWithUpperCase(key),
    value: getKusamaItem(key, info[key] || '')
  })).filter(x => isDef(x.value))

  const infoProps = {
    ...props,
    title: withTitle
      ? <KusamaTitle address={address} />
      : undefined,
    items,
    className: styles.KusamaIdentitySection
  }

  return withSection ? <InfoSection {...infoProps} /> : <InfoPanel {...infoProps} />
}
