import React from 'react'
import Link from 'next/link'
import { HeadMeta } from 'src/components/utils/HeadMeta'
import { Section } from 'src/components/utils/Section'

const SudoPage = () =>
  <>
    <HeadMeta title='Sudo' />
    <Section title='Sudo'>
      <ul>
        <li><Link href='/sudo/forceTransfer' as='/sudo/forceTransfer'>forceTransfer</Link></li>
      </ul>
    </Section>
  </>

export default SudoPage