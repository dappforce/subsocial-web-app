import React from 'react';
import { ViewSpace } from './ViewSpace';
import { useStorybookContext } from '../utils/StorybookContext';
import BN from 'bn.js';

type Props = {
  spaceId: BN
  title: JSX.Element | string
}

export const SpacegedSectionTitle = ({
  spaceId,
  title
}: Props) => {
  const { isStorybook } = useStorybookContext()
  return <>
    {!isStorybook && <>
      {/* TODO replace '<a />' tag with Next Link + URL builder */}
      <a href={`/spaces/${spaceId.toString()}`}>
        <ViewSpace nameOnly={true} id={spaceId} />
      </a>
      <span style={{ margin: '0 .75rem' }}>/</span>
    </>}
    {title}
  </>
}

export default SpacegedSectionTitle
