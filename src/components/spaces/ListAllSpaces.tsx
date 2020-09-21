import React from 'react';
import { ViewSpacePage } from './ViewSpace';
import DataList from '../utils/DataList';
import { NextPage } from 'next';
import { HeadMeta } from '../utils/HeadMeta';
import { SpaceData } from '@subsocial/types/dto';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import { CreateSpaceButton } from './helpers';
import { getAllSpaceIds } from '../utils/getIds';

type Props = {
  spacesData?: SpaceData[]
}

export const ListAllSpaces: NextPage<Props> = (props) => {
  const { spacesData = [] } = props
  const title = `Explore Spaces (${spacesData.length})`

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <HeadMeta title={title} desc='Find interesting spaces on Subsocial and follow them.' />
      <DataList
        title={title}
        dataSource={spacesData}
        noDataDesc='There are no spaces yet'
        noDataExt={<CreateSpaceButton />}
        renderItem={(item) =>
          <ViewSpacePage
            key={item.struct.id.toString()}
            {...props}
            spaceData={item}
            withFollowButton
            preview
          />
        }
      />
    </div>
  )
}

ListAllSpaces.getInitialProps = async (_props): Promise<Props> => {
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial

  const nextSpaceId = await substrate.nextSpaceId()
  const spaceIds = await getAllSpaceIds(nextSpaceId)
  const spacesData = await subsocial.findPublicSpaces(spaceIds)

  return {
    spacesData
  }
}

export default ListAllSpaces
