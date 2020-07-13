import React, { useState } from 'react';
import { ViewSpacePage } from './ViewSpace';
import ListData from '../utils/DataList';
import Button from 'antd/lib/button';
import { NextPage } from 'next';
import { HeadMeta } from '../utils/HeadMeta';
import { SpaceData } from '@subsocial/types/dto';
import { SpaceId } from '@subsocial/types/substrate/interfaces'
import { getSubsocialApi } from '../utils/SubsocialConnect';
import useSubsocialEffect from '../api/useSubsocialEffect';
import { useRouter } from 'next/router';
import { isMyAddress } from '../auth/MyAccountContext';
import { Loading } from '../utils';

type Props = {
  spacesData: SpaceData[]
  mySpaceIds: SpaceId[]
};

const useLoadHiddenSpaces = (mySpaceIds: SpaceId[]) => {
  const { query: { address } } = useRouter()
  const isMySpaces = isMyAddress(address as string)
  const [ myHiddenSpaces, setMyHiddenSpaces ] = useState<SpaceData[]>()

  useSubsocialEffect(({ subsocial }) => {
    if (!isMySpaces) return setMyHiddenSpaces([])

    subsocial.findHiddenSpaces(mySpaceIds)
      .then(setMyHiddenSpaces)

  }, [ mySpaceIds.length, isMySpaces ])

  return {
    isLoading: !myHiddenSpaces,
    myHiddenSpaces: myHiddenSpaces || []
  }
}

const SpacePreview = (space: SpaceData) => <ViewSpacePage key={`space-${space.struct.id.toString()}`} spaceData={space} previewDetails withFollowButton />

export const ListMySpaces: NextPage<Props> = (props) => {
  const { spacesData, mySpaceIds } = props;
  const { myHiddenSpaces, isLoading } = useLoadHiddenSpaces(mySpaceIds)

  const VisibleSpacesList = () => <ListData
    title={`My Spaces (${spacesData.length})`}
    dataSource={spacesData}
    renderItem={SpacePreview}
    noDataDesc='You do not have your own spaces yet'
    noDataExt={<Button href='/spaces/new' type='primary' ghost>Create my first space</Button>}
  />

  const HiddenSpacesList = () => {
    const hiddenSpacesCount = myHiddenSpaces.length
    return hiddenSpacesCount ? <ListData
      title={`My hidden spaces (${hiddenSpacesCount})`}
      dataSource={myHiddenSpaces}
      renderItem={SpacePreview}
    /> : null
  }

  return <>
    <HeadMeta title='My spaces' desc='The spaces I manage on Subsocial' />
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      {isLoading
        ? <Loading />
        : <>
          <VisibleSpacesList />
          <HiddenSpacesList />
        </>}
    </div>
  </>
};

ListMySpaces.getInitialProps = async (props): Promise<Props> => {
  const { query: { address } } = props;
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial;
  const mySpaceIds = await substrate.spaceIdsByOwner(address as string)
  const spacesData = await subsocial.findVisibleSpaces(mySpaceIds);

  return {
    spacesData,
    mySpaceIds
  }
}

export default ListMySpaces
