import { isBot } from "..";
import WarningPanel from "../WarningPanel";
import { Button } from "antd";
import styles from './index.module.sass'
import { landingPageUrl } from "../env";
import { didSignIn } from "src/components/auth/MyAccountContext";

export const SubsocialWarnPanel = () => isBot() || didSignIn()
  ? null
  : <WarningPanel
      className={styles.DfSubsocialWarnPanel}
      desc='You are on SubSocial – a social networking protocol on Polkadot & IPFS'
      action={<Button
        href={landingPageUrl}
        target='_blank'
        ghost size='small'
        className={styles.DfActionButton}
      >
        Learn more
      </Button>}
      closable
      centered
    />
