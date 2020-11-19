import { Button } from "antd";
import React from "react";
import { didSignIn } from "src/components/auth/MyAccountContext";
import { useResponsiveSize } from "src/components/responsive";
import { isBot, isServerSide } from "..";
import { landingPageUrl } from "../env";
import WarningPanel from "../WarningPanel";
import styles from './index.module.sass';

const LearnMoreButton = React.memo(() =>
  <Button
    href={landingPageUrl}
    target='_blank'
    ghost
    size='small'
    className={styles.DfActionButton}
  >
    Learn more
  </Button>
)

const InnerPanel = React.memo(() => {
  const { isMobile } = useResponsiveSize()

  const msg = isMobile
    ? 'You are on Subsocial'
    : 'You are on Subsocial – a social networking protocol on Polkadot & IPFS'

  return <div className={styles.Wrapper}>
    <WarningPanel
      className={styles.DfWhereAmIPanel}
      desc={msg}
      actions={[ <LearnMoreButton key='learn-more' /> ]}
      closable
      centered
    />
  </div>
})

export const WhereAmIPanel = () => {
  const doNotShow = isServerSide() || didSignIn() || isBot()
  return doNotShow ? null : <InnerPanel />
}
