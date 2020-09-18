import React from 'react';
import { Space } from '@subsocial/types/substrate/interfaces';
import DataList from '../utils/DataList';
import { ViewSpacePage } from '../spaces/ViewSpace';
import { SpaceData } from '@subsocial/types/dto';
import { CreateSpaceButton } from '../spaces/helpers';

type Props = {
  spacesData: SpaceData[]
}

export const LatestSpaces = (props: Props) => {
  const { spacesData = [] } = props
  const spaces = spacesData.filter((x) => typeof x.struct !== 'undefined')

  return <DataList
    title={`Latest spaces`}
    dataSource={spaces}
    noDataDesc='No spaces created yet'
    noDataExt={<CreateSpaceButton />}
    renderItem={(item) =>
      <ViewSpacePage
        {...props}
        key={(item.struct as Space).id.toString()}
        spaceData={item}
        withFollowButton
        preview
      />
    }
  />
}
