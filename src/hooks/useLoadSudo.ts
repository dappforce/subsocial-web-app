import { AccountId } from '@polkadot/types/interfaces'
import { newLogger } from '@subsocial/utils'
import { useState } from 'react'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'

const log = newLogger(useLoadSudo.name)

/** Load the sudo key from Substrate blockchain. */
export function useLoadSudo () {
  const [ sudo, setSudo ] = useState<AccountId>()

  useSubsocialEffect(({ substrate }) => {
    let isMounted = true

    const load = async () => {
      const api = await substrate.api
      const sudo = await api.query.sudo.key()
      isMounted && setSudo(sudo)
    }

    load().catch(err => log.error('Failed to load the sudo key:', err))

    return () => { isMounted = false }
  }, [])

  return sudo
}
