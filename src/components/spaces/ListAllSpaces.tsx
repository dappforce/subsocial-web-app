import React from 'react';
import { ViewSpace } from './ViewSpace';
import { NextPage } from 'next';
import { HeadMeta } from '../utils/HeadMeta';
import { SpaceData } from '@subsocial/types/dto';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import { CreateSpaceButton } from './helpers';
import { getPageOfSpaceIds, approxCountOfPublicSpaces } from '../utils/getIds';
import BN from 'bn.js'
import { ZERO, resolveBn } from '../utils';
import { PaginatedList } from '../lists/PaginatedList';

type Props = {
  spacesData?: SpaceData[]
  totalSpaceCount?: BN
}

const getTitle = (count: number | BN) => `Explore Spaces (${count})`

export const ListAllSpaces = (props: Props) => {
  const { spacesData = [], totalSpaceCount = ZERO } = props
  const totalCount = resolveBn(totalSpaceCount).toNumber()
  const title = getTitle(totalCount) // TODO resolve bn when as hex and as BN

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <PaginatedList
        title={title}
        totalCount={totalCount}
        dataSource={spacesData}
        noDataDesc='There are no spaces yet'
        noDataExt={<CreateSpaceButton />}
        renderItem={(item: any) =>
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
  const { totalSpaceCount = ZERO } = props
  const title = getTitle(resolveBn(totalSpaceCount))

  return <>
    <HeadMeta title={title} desc='Discover and follow interesting spaces on Subsocial.' />
    <ListAllSpaces {...props} />
  </>
}

ListAllSpacesPage.getInitialProps = async (props): Promise<Props> => {
  const { query } = props
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial

  const nextSpaceId = await substrate.nextSpaceId()
  const spaceIds = await getPageOfSpaceIds(nextSpaceId, query)
  const spacesData = await subsocial.findPublicSpaces(spaceIds)
  const totalSpaceCount = approxCountOfPublicSpaces(nextSpaceId)

  return {
    spacesData,
    totalSpaceCount
  }
}

export default ListAllSpacesPage
