import { AnyAccountId } from "@subsocial/types";
import { BareProps } from "../utils/types";

export type KusamaBareProps = BareProps & {
  address: AnyAccountId
}

export type KusamaInfo = {
  display: string,
  legal: string,
  web: string,
  riot: string,
  email: string,
  twitter: string
}

export type KusamaInfoKeys = keyof KusamaInfo

export const identityInfoKeys: KusamaInfoKeys[] = [ 'display', 'legal', 'web', 'riot', 'email', 'twitter' ]
