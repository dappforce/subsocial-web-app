import React from 'react';
import { ViewSpace } from './ViewSpace';
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

const getTitle = (count: number) => `Explore Spaces (${count})`

export const ListAllSpaces = (props: Props) => {
  const { spacesData = [] } = props
  const title = getTitle(spacesData.length)

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <DataList
        title={title}
        dataSource={spacesData}
        noDataDesc='There are no spaces yet'
        noDataExt={<CreateSpaceButton />}
        renderItem={(item) =>
          <ViewSpace
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

const ListAllSpacesPage: NextPage<Props> = (props) => {
  const { spacesData = [] } = props
  const title = getTitle(spacesData.length)

  return <>
      <HeadMeta title={title} desc='Discover and follow interesting spaces on Subsocial.' />
      <ListAllSpaces {...props} />
  </>
}

ListAllSpacesPage.getInitialProps = async (_props): Promise<Props> => {
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial

  const nextSpaceId = await substrate.nextSpaceId()
  const spaceIds = await getAllSpaceIds(nextSpaceId)
  const spacesData = await subsocial.findPublicSpaces(spaceIds)

  return {
    spacesData
  }
}

export default ListAllSpacesPage
