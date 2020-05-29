import React from 'react';
import { ViewSpacePage } from './ViewSpace';
import ListData from '../utils/DataList';
import { Button } from 'antd';
import { NextPage } from 'next';
import { HeadMeta } from '../utils/HeadMeta';
import { SpaceData } from '@subsocial/types/dto';
import { getSubsocialApi } from '../utils/SubsocialConnect';

type Props = {
  spacesData: SpaceData[];
};

export const ListMySpaces: NextPage<Props> = (props) => {
  const { spacesData } = props;
  const totalCount = spacesData.length;

  return <>
    <HeadMeta title='My spaces' desc='The spaces I manage on Subsocial' />
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <ListData
        title={`My Spaces (${totalCount})`}
        dataSource={spacesData}
        renderItem={(item, index) => <ViewSpacePage {...props} key={index} spaceData={item} previewDetails withFollowButton />}
        noDataDesc='You do not have your own spaces yet'
        noDataExt={<Button href='/spaces/new'>Create my first space</Button>}
      />
    </div>
  </>
};

ListMySpaces.getInitialProps = async (props): Promise<Props> => {
  const { query: { address } } = props;
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial;
  const mySpaceIds = await substrate.spaceIdsByOwner(address as string)
  const spacesData = await subsocial.findSpaces(mySpaceIds);

  return {
    spacesData
  }
}

export default ListMySpaces
