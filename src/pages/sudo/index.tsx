import React from 'react'
import Link from 'next/link'
import { PageContent } from 'src/components/main/PageWrapper'

const TITLE = 'Sudo'

const SudoPage = () => <PageContent meta={{ title: TITLE }} title={TITLE}>
  <ul>
    <li>
      <Link href='/sudo/forceTransfer' as='/sudo/forceTransfer'>
        forceTransfer
      </Link>
    </li>
  </ul>
</PageContent>

export default SudoPage