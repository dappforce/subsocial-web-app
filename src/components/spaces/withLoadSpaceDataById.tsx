import React, { useEffect, useState } from 'react';
import { useSubsocialApi } from '../utils/SubsocialApiContext'
import { Loading } from '../utils/utils';
import NoData from '../utils/EmptyList';
import { SpaceData, ProfileData } from '@subsocial/types/dto'
import { ViewSpaceProps } from './ViewSpaceProps';

type Props = ViewSpaceProps

export const withLoadSpaceDataById = (Component: React.ComponentType<Props>) => {
  return (props: Props) => {
    const { id } = props

    if (!id) return <NoData description={<span>Space id is undefined</span>} />

    const { subsocial } = useSubsocialApi()
    const [ spaceData, setSpaceData ] = useState<SpaceData>()
    const [ owner, setOwner ] = useState<ProfileData>()

    useEffect(() => {
      const loadData = async () => {
        const spaceData = await subsocial.findSpace({ id })
        if (spaceData) {
          setSpaceData(spaceData)
          const ownerId = spaceData.struct.owner
          const owner = await subsocial.findProfile(ownerId)
          setOwner(owner);
        }
      }
      loadData()
    }, [ false ])

    return spaceData?.content
      ? <Component spaceData={spaceData} owner={owner} {...props}/>
      : <Loading />
  }
}

export default withLoadSpaceDataById
