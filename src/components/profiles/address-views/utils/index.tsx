import { useState } from 'react'
import { AnyAccountId } from '@subsocial/types'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect';
import { useSubstrateContext } from 'src/components/substrate';
import { Copy } from 'src/components/urls/helpers';

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

type CopyAddressProps = {
  address: AnyAccountId,
  message?: string,
  children: React.ReactNode
}

export const CopyAddress = ({ address, message = 'Address copied', children }: CopyAddressProps) =>
  <Copy text={address.toString()} message={message}>{children}</Copy>
