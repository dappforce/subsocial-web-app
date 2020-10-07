import React from 'react';
import { Space } from '@subsocial/types/substrate/interfaces';
import { ViewSpace } from '../spaces/ViewSpace';
import { SpaceData } from '@subsocial/types/dto';
import { CreateSpaceButton, AllSpacesLink } from '../spaces/helpers';
import DataList from '../lists/DataList';
import { ButtonLink } from 'src/components/utils/ButtonLink';

type Props = {
  spacesData: SpaceData[]
}

export const LatestSpaces = (props: Props) => {
  const { spacesData = [] } = props
  const spaces = spacesData.filter((x) => typeof x.struct !== 'undefined')

  return <>
    <DataList
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
    <ButtonLink block href='/spaces/all' as='/spaces/all' className='mb-2'>See all spaces</ButtonLink>
  </>
}
