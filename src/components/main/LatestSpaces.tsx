import React from 'react';
import { Button } from 'antd';
import { Space } from '@subsocial/types/substrate/interfaces';
import ListData from '../utils/DataList';
import { ViewSpacePage } from '../spaces/ViewSpace';
import { SpaceData } from '@subsocial/types/dto';

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
    noDataExt={<Button type='primary' ghost href='/spaces/new'>Create space</Button>}
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
