import { Button } from "antd";
import React from "react";
import { didSignIn } from "src/components/auth/MyAccountContext";
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

const InnerPanel = React.memo(() =>
  <WarningPanel
    className={styles.DfWhereAmIPanel}
    desc='You are on Subsocial – a social networking protocol on Polkadot & IPFS'
    actions={[ <LearnMoreButton /> ]}
    closable
    centered
  />
)

export const WhereAmIPanel = () => {
  const doNotShow = isServerSide() || didSignIn() || isBot()
  return doNotShow ? null : <InnerPanel />
}
