import { isBot, isServerSide } from "..";
import WarningPanel from "../WarningPanel";
import { Button } from "antd";
import styles from './index.module.sass'
import { landingPageUrl } from "../env";
import { didSignIn } from "src/components/auth/MyAccountContext";

export const WhereAmIPanel = () => isServerSide() || didSignIn() || isBot()
  ? null
  : <WarningPanel
      className={styles.DfWhereAmIPanel}
      desc='You are on Subsocial – a social networking protocol on Polkadot & IPFS'
      actions={[<Button
        href={landingPageUrl}
        target='_blank'
        ghost size='small'
        className={styles.DfActionButton}
      >
        Learn more
      </Button>]}
      closable
      centered
    />
