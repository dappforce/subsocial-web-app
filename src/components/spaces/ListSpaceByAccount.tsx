import React, { useState } from 'react';
import { ViewSpacePage } from './ViewSpace';
import DataList from '../utils/DataList';
import { NextPage } from 'next';
import { HeadMeta } from '../utils/HeadMeta';
import { SpaceData } from '@subsocial/types/dto';
import { SpaceId } from '@subsocial/types/substrate/interfaces'
import { getSubsocialApi } from '../utils/SubsocialConnect';
import useSubsocialEffect from '../api/useSubsocialEffect';
import { isMyAddress, useMyAddress } from '../auth/MyAccountContext';
import { Loading } from '../utils';
import { NewSpaceButton } from './helpers';
import { newLogger } from '@subsocial/utils';
import { AnyAccountId } from '@subsocial/types';
import { return404 } from '../utils/next';
import { PlusOutlined } from '@ant-design/icons';

type Props = {
  spacesData: SpaceData[]
  mySpaceIds: SpaceId[],
  address: AnyAccountId
};

const log = newLogger('ListSpaceByAccount')

const useLoadUnlistedSpaces = ({ address, mySpaceIds }: Props) => {
  const isMySpaces = isMyAddress(address as string)
  const [ myUnlistedSpaces, setMyUnlistedSpaces ] = useState<SpaceData[]>()

  useSubsocialEffect(({ subsocial }) => {
    if (!isMySpaces) return setMyUnlistedSpaces([])

    subsocial.findUnlistedSpaces(mySpaceIds)
      .then(setMyUnlistedSpaces).catch((err) => log.error('Failed load Unlisted spaces. Error: %', err))

  }, [ mySpaceIds.length, isMySpaces ])

  console.log(isMySpaces, myUnlistedSpaces)

  return {
    isLoading: !myUnlistedSpaces,
    myUnlistedSpaces: myUnlistedSpaces || []
  }
}

const SpacePreview = (space: SpaceData) => <ViewSpacePage key={`space-${space.struct.id.toString()}`} spaceData={space} preview withFollowButton />

const VisibleSpacesList = ({ spacesData, mySpaceIds }: Props) => {
  const noSpaces = !mySpaceIds.length

  return <DataList
    title={<span className='d-flex justify-content-between align-items-center w-100 mb-2'>
      <span>{`Spaces (${spacesData.length})`}</span>
      {!noSpaces && <NewSpaceButton
        icon={<PlusOutlined />}
        type='primary'
        ghost
      >
        Create space
      </NewSpaceButton>}
    </span>}
    dataSource={spacesData}
    renderItem={SpacePreview}
    noDataDesc='You do not have your own public spaces yet'
    noDataExt={noSpaces && <NewSpaceButton type='primary' ghost>Create my first space</NewSpaceButton>}
  />
}

const UnlistedSpacesList = (props: Props) => {
  const { myUnlistedSpaces, isLoading } = useLoadUnlistedSpaces(props)

  if (isLoading) return <Loading />

  const UnlistedSpacesCount = myUnlistedSpaces.length
  return UnlistedSpacesCount ? <DataList
    title={`Unlisted spaces (${UnlistedSpacesCount})`}
    dataSource={myUnlistedSpaces}
    renderItem={SpacePreview}
  /> : null
}

export const ListSpaceByAccount: NextPage<Props> = (props) => {
  return <>
    <HeadMeta title='Spaces' desc='The spaces I manage on Subsocial' />
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <VisibleSpacesList {...props} />
      <UnlistedSpacesList {...props} />
    </div>
  </>
};

ListSpaceByAccount.getInitialProps = async (props): Promise<Props> => {
  const { query: { address } } = props;

  if (!address || typeof address !== 'string') {
    return return404(props) as any
  }

  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial;
  const mySpaceIds = await substrate.spaceIdsByOwner(address)
  const spacesData = await subsocial.findPublicSpaces(mySpaceIds);

  return {
    spacesData,
    mySpaceIds,
    address
  }
}

export const ListMySpaces = () => {
  const address = useMyAddress()

  if (!address) return null

  const [ state, setState ] = useState<Props>()

  useSubsocialEffect(({ subsocial, substrate }) => {
    const loadMySpaces = async () => {
      const mySpaceIds = await substrate.spaceIdsByOwner(address as string)
      const spacesData = await subsocial.findPublicSpaces(mySpaceIds);

      setState({ mySpaceIds, spacesData, address })
    }

    loadMySpaces().catch((err) => log.error('Failed load my spaces. Error: %', err))

  }, [ address ])

  return state
    ? <ListSpaceByAccount {...state} />
    : <Loading label='Loading your spaces' />
}

export default ListSpaceByAccount
