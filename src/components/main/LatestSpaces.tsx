import React from 'react';
import { Space } from '@subsocial/types/substrate/interfaces';
import DataList from '../utils/DataList';
import { ViewSpace } from '../spaces/ViewSpace';
import { SpaceData } from '@subsocial/types/dto';
import { CreateSpaceButton } from '../spaces/helpers';
import Link from 'next/link';
import { BareProps } from '../utils/types';

type Props = {
  spacesData: SpaceData[]
}

export const AllSpacesLink = (props: BareProps) => <Link href='/spaces/all' as='/spaces/all'>
  <a className='DfGreyLink text-uppercase' style={{ fontSize: '1rem' }} {...props}>All</a>
</Link>

export const LatestSpaces = (props: Props) => {
  const { spacesData = [] } = props
  const spaces = spacesData.filter((x) => typeof x.struct !== 'undefined')

  return <DataList
    title={<span className='d-flex justify-content-between align-items-end w-100'>
      {'Latest spaces'}
      <AllSpacesLink />
    </span>}
    dataSource={spaces}
    noDataDesc='No spaces created yet'
    noDataExt={<CreateSpaceButton />}
    renderItem={(item) =>
      <ViewSpace
        {...props}
        key={(item.struct as Space).id.toString()}
        spaceData={item}
        withFollowButton
        preview
      />
    }
  />
}
