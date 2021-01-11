import React from 'react'
import Link from 'next/link'
import { HasAddressOrHandle, accountUrl } from '../urls'

type Props = {
  account: HasAddressOrHandle
  title?: React.ReactNode
  hint?: string
  className?: string
}

export const ViewProfileLink = React.memo(({
  account,
  title,
  hint,
  className
}: Props) => {
  const { address } = account

  if (!address) return null

  return (
    <Link href='/accounts/[address]' as={accountUrl(account)}>
      <a className={className} title={hint}>{title || address.toString()}</a>
    </Link>
  )
})

export default ViewProfileLink
