import React from 'react';
import Link from 'next/link';
import { useStorybookContext } from '../utils/StorybookContext';
import { SpaceData } from '@subsocial/types'
import { spaceUrl } from '../utils/urls';

type Props = {
  space?: SpaceData
  subtitle: React.ReactNode
}

export const SpacegedSectionTitle = ({
  space,
  subtitle
}: Props) => {
  const { isStorybook } = useStorybookContext()
  const name = space?.content?.name

  return <>
    {!isStorybook && space && name && <>
      <Link href='/spaces/[spaceId]' as={spaceUrl(space.struct)}>
        <a>{name}</a>
      </Link>
      <span style={{ margin: '0 .75rem' }}>/</span>
    </>}
    {subtitle}
  </>
}

export default SpacegedSectionTitle
