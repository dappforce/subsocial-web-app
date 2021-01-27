import { AnyAccountId } from "@subsocial/types"
import { useKusamaContext } from "./KusamaContext"
import { useState, useEffect } from "react"
import { Registration } from "@polkadot/types/interfaces"
import { isEmptyStr, newLogger } from "@subsocial/utils"
import { KusamaInfo, identityInfoKeys, KusamaInfoKeys } from "./types"
import { hexToString } from '@polkadot/util'

const log = newLogger('Kusama')

export const useKusamaIdentity = (address: AnyAccountId) => {
  const { getIdentity, hasKusamaConnection } = useKusamaContext()
  const [ kusamaDetails, setInfo ] = useState<Registration>()

  useEffect(() => {
    getIdentity(address).then(setInfo).catch(log.error)
  }, [ hasKusamaConnection, address ])

  if (!kusamaDetails || !hasKusamaConnection) return undefined

  const info: KusamaInfo = {} as KusamaInfo;

  identityInfoKeys.forEach(key => { info[key] = hexToString(kusamaDetails.info[key].asRaw.toString()) })
  const isVerifySignIn = !!kusamaDetails.judgements.filter(x => x[1].isReasonable).length
  return {
    info,
    isVerifySignIn
  };
}

export const getKusamaItem = (key: KusamaInfoKeys, value: string) => {
  if (isEmptyStr(value)) return undefined

  switch(key) {
    case 'email': return <a href={`mailto:${value}`}>{value}</a>
    case 'twitter': return <a href={`https://twitter.com/${value.replace('@', '')}`}>{value}</a>
    case 'web': return <a href={value}>{value}</a>
    case 'riot': return <a href={value}>{value}</a>
    default: return value
  }
}

