import React from 'react'
import Link from 'next/link'
import { HasAddressOrUsername, accountUrl } from '../utils/urls'

type Props = {
  account: HasAddressOrUsername
  title?: string
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
    <Link href='/profile/[address]' as={accountUrl(account)}>
      <a className={className} title={hint}>{title}</a>
    </Link>
  )
}

export default ViewProfileLink
