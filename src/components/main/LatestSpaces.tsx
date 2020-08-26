import React from 'react';
import { Space } from '@subsocial/types/substrate/interfaces';
import ListData from '../utils/DataList';
import { ViewSpacePage } from '../spaces/ViewSpace';
import { SpaceData } from '@subsocial/types/dto';
import { NewSpaceButton } from '../spaces/helpers';

type Props = {
  spacesData: SpaceData[]
}

export const LatestSpaces = (props: Props) => {
  const { spacesData = [] } = props
  const spaces = spacesData.filter((x) => typeof x.struct !== 'undefined')

  return <ListData
    title={`Latest spaces`}
    dataSource={spaces}
    noDataDesc='No spaces created yet'
    noDataExt={<NewSpaceButton type='primary' ghost >Create space</NewSpaceButton>}
    renderItem={(item) =>
      <ViewSpacePage
        {...props}
        key={(item.struct as Space).id.toString()}
        spaceData={item}
        previewDetails
        withFollowButton
      />
    }
  />
}
