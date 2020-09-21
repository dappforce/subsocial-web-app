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
import { CreateSpaceButton } from './helpers';
import { newLogger } from '@subsocial/utils';
import { AnyAccountId } from '@subsocial/types';
import { return404 } from '../utils/next';

type LoadSpacesType = {
  spacesData: SpaceData[]
  mySpaceIds: SpaceId[]

}

type BaseProps = {
  address: AnyAccountId
}

type LoadSpacesProps = LoadSpacesType & BaseProps

type Props = Partial<LoadSpacesType> & BaseProps

const log = newLogger('AccountSpaces')

export const useLoadAccoutPublicSpaces = (address?: AnyAccountId): LoadSpacesProps | undefined => {

  if (!address) return undefined

  const [ state, setState ] = useState<LoadSpacesProps>()

  useSubsocialEffect(({ subsocial, substrate }) => {
    const loadMySpaces = async () => {
      const mySpaceIds = await substrate.spaceIdsByOwner(address as string)
      const spacesData = await subsocial.findPublicSpaces(mySpaceIds)

      setState({ mySpaceIds, spacesData, address })
    }

    loadMySpaces().catch((err) => log.error('Failed load my spaces. Error: %', err))

  }, [ address ])

  return state
}

const useLoadUnlistedSpaces = ({ address, mySpaceIds }: LoadSpacesProps) => {
  const isMySpaces = isMyAddress(address as string)
  const [ myUnlistedSpaces, setMyUnlistedSpaces ] = useState<SpaceData[]>()

  useSubsocialEffect(({ subsocial }) => {
    if (!isMySpaces) return setMyUnlistedSpaces([])

    subsocial.findUnlistedSpaces(mySpaceIds)
      .then(setMyUnlistedSpaces).catch((err) => log.error('Failed load Unlisted spaces. Error: %', err))

  }, [ mySpaceIds.length, isMySpaces ])

  return {
    isLoading: !myUnlistedSpaces,
    myUnlistedSpaces: myUnlistedSpaces || []
  }
}

const SpacePreview = (space: SpaceData) =>
  <ViewSpacePage
    key={`space-${space.struct.id.toString()}`}
    spaceData={space}
    withFollowButton
    preview
  />

const PublicSpaces = ({ spacesData , mySpaceIds, address }: LoadSpacesProps) => {
  const noSpaces = !mySpaceIds.length
  const isMy = isMyAddress(address)

  return <DataList
    title={<span className='d-flex justify-content-between align-items-center w-100 mb-2'>
      <span>{`Public Spaces (${spacesData.length})`}</span>
      {!noSpaces && isMy && <CreateSpaceButton />}
    </span>}
    dataSource={spacesData}
    renderItem={SpacePreview}
    noDataDesc='You do not own public spaces yet'
    noDataExt={noSpaces && isMy &&
      <CreateSpaceButton>
        Create my first space
      </CreateSpaceButton>
    }
  />
}

const UnlistedSpaces = (props: LoadSpacesProps) => {
  const { myUnlistedSpaces, isLoading } = useLoadUnlistedSpaces(props)

  if (isLoading) return <Loading />

  const unlistedSpacesCount = myUnlistedSpaces.length
  return unlistedSpacesCount ? <DataList
    title={`Unlisted Spaces (${unlistedSpacesCount})`}
    dataSource={myUnlistedSpaces}
    renderItem={SpacePreview}
  /> : null
}

export const AccountSpaces: NextPage<Props> = (props) => {
  const state = props.mySpaceIds
    ? props as LoadSpacesProps
    : useLoadAccoutPublicSpaces(props.address)

  if (!state) return <Loading label='Loading public spaces'/>

  return <>
    <HeadMeta title='Spaces' desc={`Subsocial spaces owned by ${props.address}`} />
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <PublicSpaces {...state} />
      <UnlistedSpaces {...state} />
    </div>
  </>
}

AccountSpaces.getInitialProps = async (props): Promise<Props> => {
  const { query: { address } } = props

  if (!address || typeof address !== 'string') {
    return return404(props) as any
  }

  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial
  const mySpaceIds = await substrate.spaceIdsByOwner(address)
  const spacesData = await subsocial.findPublicSpaces(mySpaceIds)

  return {
    spacesData,
    mySpaceIds,
    address
  }
}

export const ListMySpaces = () => {
  const address = useMyAddress()
  const state = useLoadAccoutPublicSpaces(address)

  return state
    ? <AccountSpaces {...state} />
    : <Loading label='Loading your spaces' />
}

export default AccountSpaces
