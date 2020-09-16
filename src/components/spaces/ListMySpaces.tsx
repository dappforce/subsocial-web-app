import React, { useState, useMemo } from 'react';
import { ViewSpacePage } from './ViewSpace';
import DataList from '../utils/DataList';
import { NextPage } from 'next';
import { HeadMeta } from '../utils/HeadMeta';
import { SpaceData } from '@subsocial/types/dto';
import { SpaceId } from '@subsocial/types/substrate/interfaces'
import { getSubsocialApi } from '../utils/SubsocialConnect';
import useSubsocialEffect from '../api/useSubsocialEffect';
import { useRouter } from 'next/router';
import { isMyAddress } from '../auth/MyAccountContext';
import { Loading } from '../utils';
import { NewSpaceButton } from './helpers';

type Props = {
  spacesData: SpaceData[]
  mySpaceIds: SpaceId[]
};

const useLoadUnlistedSpaces = (mySpaceIds: SpaceId[]) => {
  const { query: { address } } = useRouter()
  const isMySpaces = isMyAddress(address as string)
  const [ myHiddenSpaces, setMyHiddenSpaces ] = useState<SpaceData[]>()

  useSubsocialEffect(({ subsocial }) => {
    if (!isMySpaces) return setMyHiddenSpaces([])

    subsocial.findUnlistedSpaces(mySpaceIds)
      .then(setMyHiddenSpaces)

  }, [ mySpaceIds.length, isMySpaces ])

  return {
    isLoading: !myHiddenSpaces,
    myHiddenSpaces: myHiddenSpaces || []
  }
}

const SpacePreview = (space: SpaceData) => <ViewSpacePage key={`space-${space.struct.id.toString()}`} spaceData={space} preview withFollowButton />

const VisibleSpacesList = ({ spacesData }: Props) => <DataList
  title={`My spaces (${spacesData.length})`}
  dataSource={spacesData}
  renderItem={SpacePreview}
  noDataDesc='You do not have any spaces yet'
  noDataExt={<NewSpaceButton type='primary' ghost>Create my first space</NewSpaceButton>}
/>

const HiddenSpacesList = ({ mySpaceIds }: Props) => {
  const { myHiddenSpaces, isLoading } = useLoadUnlistedSpaces(mySpaceIds)

  console.log('myHiddenSpaces', myHiddenSpaces)
  if (isLoading) return <Loading />

  const hiddenSpacesCount = myHiddenSpaces.length
  return hiddenSpacesCount ? <DataList
    title={`My unlisted spaces (${hiddenSpacesCount})`}
    dataSource={myHiddenSpaces}
    renderItem={SpacePreview}
  /> : null
}

export const ListMySpaces: NextPage<Props> = (props) => {
  const HiddenSpaces = useMemo(() => <HiddenSpacesList {...props} />, [])

  return <>
    <HeadMeta title='My spaces' desc='The spaces I manage on Subsocial' />
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <VisibleSpacesList {...props} />
      {HiddenSpaces}
    </div>
  </>
};

ListMySpaces.getInitialProps = async (props): Promise<Props> => {
  const { query: { address } } = props;
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial;
  const mySpaceIds = await substrate.spaceIdsByOwner(address as string)
  const spacesData = await subsocial.findPublicSpaces(mySpaceIds);

  return {
    spacesData,
    mySpaceIds
  }
}

export default ListMySpaces
