import React from 'react'
import Link from 'next/link'
import { HasAddressOrHandle, accountUrl } from '../urls'

type Props = {
  account: HasAddressOrHandle
  title?: React.ReactNode
  hint?: string
  className?: string
}

export const ViewProfileLink = ({
  account,
  title,
  hint,
  className
}: Props) => {

  if (!account.address || !title) return null

  return (
    <Link href='/accounts/[address]' as={accountUrl(account)}>
      <a className={className} title={hint}>{title}</a>
    </Link>
  )
}

export default ViewProfileLink
