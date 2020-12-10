import { AnyAccountId } from '@subsocial/types'
import { Tabs } from 'antd'
import partition from 'lodash.partition'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import PaginatedList from 'src/components/lists/PaginatedList'
import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_SIZE } from 'src/config/ListData.config'
import messages from 'src/messages'
import { useAppSelector } from 'src/rtk/app/store'
import { useFetchFollowedSpaces, useFetchOwnedSpaces } from 'src/rtk/features/spaceIds/spaceIdsHooks'
import { selectSpaces } from 'src/rtk/features/spaces/spacesSlice'
import { isUnlisted, SpaceData, SpaceId } from 'src/types'
import { isMyAddress } from '../auth/MyAccountContext'
import { PageContent } from '../main/PageWrapper'
import { useSubstrateContext } from '../substrate'
import { Loading, toShortAddress } from '../utils'
import Section from '../utils/Section'
import { CreateSpaceButton } from './helpers'
import { SpacePreview } from './SpacePreview'

const { TabPane }= Tabs

export type LoadSpacesType = {
  spacesData: SpaceData[]
  spaceIds: SpaceId[] // TODO rename to just `spaceIds`
}

type BaseProps = {
  address: AnyAccountId,
  withTitle?: boolean
}

type InnerSpacesList = {
  totalCount: number,
  title?: React.ReactNode,
  isMy?: boolean,
  paginationOff?: boolean
}

type SpacesListProps = InnerSpacesList & {
  spaces: SpaceData[]
}

const SpacesList = (props: SpacesListProps) => {
  const { spaces, totalCount, isMy, title, paginationOff } = props
  const noSpaces = totalCount === 0

  return <PaginatedList
    title={title}
    totalCount={totalCount}
    dataSource={spaces}
    getKey={item => item.id}
    renderItem={item => <SpacePreview space={item} />}
    noDataDesc='No spaces found'
    noDataExt={noSpaces && isMy &&
      <CreateSpaceButton>
        Create my first space
      </CreateSpaceButton>
    }
    paginationOff={paginationOff}
  />
}

type SpacesListBySpaceIdsProps = InnerSpacesList & {
  spaceIds: SpaceId[]
}

const SpacesListBySpaceIds = ({ spaceIds, ...props }: SpacesListBySpaceIdsProps) => {
  const spaces = useAppSelector(state => selectSpaces(state, { ids: spaceIds }))
  return <SpacesList spaces={spaces} {...props} />
}

type AccountSpacesProps = BaseProps & {
  withTabs?: boolean
}

export const OwnedSpacesList = ({ withTabs = false, withTitle, ...props}: AccountSpacesProps) => {
  const address = props.address.toString()
  const { query: { page = DEFAULT_FIRST_PAGE, size = DEFAULT_PAGE_SIZE } } = useRouter()

  const [ unlistedSpaceIds, setUnistedSpaceIds ] = useState<SpaceId[]>([])
  const { spaces, spaceIds, error, loading } = useFetchOwnedSpaces(address)
  const [ newUnlistedSpaces ] = partition(spaces, isUnlisted)
  const { connecting } = useSubstrateContext()
  const isMy = isMyAddress(address)

  const totalCount = spaceIds.length
  const unlistedCount = unlistedSpaceIds.length

  useEffect(() => {
    const set = new Set(unlistedSpaceIds)
    const newIds: SpaceId[] = []

    newUnlistedSpaces.forEach(({ struct: { id }}) => {
      if (!set.has(id)) {
        set.add(id)
        newIds.push(id)
      }
    })

    setUnistedSpaceIds(unlistedSpaceIds.concat(newIds))
  }, [ newUnlistedSpaces.length, page, size ])

  const PublicSpaces = useMemo(() => <SpacesList
    spaces={spaces}
    totalCount={totalCount}
    isMy={isMy}
    {...props}
  />, [ spaces.length ])

  if (connecting) return <Loading label={messages.connectingToNetwork} />
  
  if (error) return null

  if (loading) return <Loading label='Loading spaces...' />

  const title = withTitle
    ? <span className='d-flex justify-content-between align-items-center w-100 my-2'>
      <span>{isMy ? 'My spaces' : `Spaces of ${toShortAddress(address)}`}</span>
      {totalCount && isMy && <CreateSpaceButton />}
    </span>
    : null

  return isUnlisted && withTabs && isMy
    ? <Section className='m-0' title={title}> 
      <Tabs>
        <TabPane tab={`All (${totalCount})`} key='all'>
          {PublicSpaces}
        </TabPane>
        <TabPane tab={`Unlisted (${unlistedSpaceIds.length})`} key='unlisted'>
          <SpacesListBySpaceIds
            spaceIds={unlistedSpaceIds}
            totalCount={unlistedCount}
            paginationOff
            {...props}
          />
        </TabPane>
      </Tabs>
    </Section>
    : PublicSpaces
}

export const OwnedSpacesPage = () => {
  const { address } = useRouter().query

  if (!address) return null

  return <PageContent 
      meta={{
        title: 'Account spaces',
        desc: `Subsocial spaces owned by ${address}`
      }}
    >
    <OwnedSpacesList address={address as string} withTabs withTitle />
  </PageContent>
}

export const FollowingSpacesList = (props: BaseProps) => {
  const address = props.address.toString()
  const { spaceIds, spaces, error, loading } = useFetchFollowedSpaces(address)

  if (error) return null

  if (loading) return <Loading label='Loading spaces...' />

  const totalCount = spaceIds.length

  const title = isMyAddress(address)
    ? `My Subscriptions (${totalCount})`
    // TODO Improve a title: username | extension name | short addresss
    : `Subscriptions of ${toShortAddress(address)}`

  return <SpacesList spaces={spaces} totalCount={totalCount} title={title} /> 
}

export const FollowingSpacesPage = () => {
  const { address } = useRouter().query

  if (!address) return null

  return <PageContent 
    meta={{
      title: `Subscriptions of ${address}`,
      desc: `Spaces that ${address} follows on Subsocial`
    }}
    >
    <FollowingSpacesList address={address as string} withTitle />
  </PageContent>
}


