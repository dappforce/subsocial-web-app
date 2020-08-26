import { useState } from 'react'
import { AnyAccountId } from '@subsocial/types'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect';
import { useSubstrateContext } from 'src/components/substrate';

export const useExtensionName = (address: AnyAccountId) => {
  const [ extensionName, setExtensionName ] = useState<string>()
  const { keyring } = useSubstrateContext()

  useSubsocialEffect(() => {
    if (!keyring) return

    const name = keyring.getAccount(address)?.meta.name
    name && setExtensionName(name)
  }, [ keyring, address ])

  return extensionName?.replace('(polkadot-js)', '').toUpperCase()
}
