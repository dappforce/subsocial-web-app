import React, { useState } from 'react'
import { ViewSpace } from './ViewSpace'
import PaginatedList from 'src/components/lists/PaginatedList'
import { NextPage } from 'next'
import { SpaceData } from '@subsocial/types/dto'
import { SpaceId } from '@subsocial/types/substrate/interfaces'
import { getSubsocialApi } from '../utils/SubsocialConnect'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { isMyAddress, useMyAddress } from '../auth/MyAccountContext'
import { Loading } from '../utils'
import { CreateSpaceButton } from './helpers'
import { newLogger } from '@subsocial/utils'
import { AnyAccountId } from '@subsocial/types'
import { return404 } from '../utils/next'
import { getPageOfIds } from '../utils/getIds'
import { useRouter } from 'next/router'
import DataList from '../lists/DataList'
import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_SIZE } from 'src/config/ListData.config'
import { PageContent } from '../main/PageWrapper'

export type LoadSpacesType = {
  spacesData: SpaceData[]
  mySpaceIds: SpaceId[] // TODO rename to just `spaceIds`
}

type BaseProps = {
  address: AnyAccountId,
  withTitle?: boolean
}

type LoadSpacesProps = LoadSpacesType & BaseProps

type Props = Partial<LoadSpacesType> & BaseProps

const log = newLogger('AccountSpaces')

export const useLoadAccoutPublicSpaces = (
  address?: AnyAccountId,
  initialSpaceIds?: SpaceId[]
): LoadSpacesProps | undefined => {

  if (!address) return undefined

  const { query } = useRouter()
  const [ mySpaceIds, setSpaceIds ] = useState<SpaceId[]>(initialSpaceIds || [])
  const [ spacesData, setSpacesData ] = useState<SpaceData[]>([])
  const page = query.page || DEFAULT_FIRST_PAGE
  const size = query.size || DEFAULT_PAGE_SIZE

  const spacesCount = mySpaceIds.length

  useSubsocialEffect(({ substrate }) => {
    if (spacesCount) return

    const loadSpaceIds = async () => {
      const mySpaceIds = await substrate.spaceIdsByOwner(address)
      setSpaceIds(mySpaceIds.reverse())
    }

    loadSpaceIds().catch((err) =>
      log.error('Failed to load space ids by account', address.toString(), err)
    )
  }, [ address.toString() ])

  useSubsocialEffect(({ subsocial }) => {
    if (!spacesCount) return

    const loadSpaces = async () => {
      const pageIds = getPageOfIds(mySpaceIds, query)
      const spacesData = await subsocial.findPublicSpaces(pageIds)
      setSpacesData(spacesData)
    }

    loadSpaces().catch((err) =>
      log.error('Failed to load spaces by account', address.toString(), err)
    )
  }, [ address.toString(), spacesCount, page, size ])

  if (!spacesData.length) return undefined

  return {
    spacesData,
    mySpaceIds,
    address
  }
}

const useLoadUnlistedSpaces = ({ address, mySpaceIds }: LoadSpacesProps) => {
  const isMySpaces = isMyAddress(address)
  const [ myUnlistedSpaces, setMyUnlistedSpaces ] = useState<SpaceData[]>()

  useSubsocialEffect(({ subsocial }) => {
    if (!isMySpaces) return setMyUnlistedSpaces([])

    subsocial.findUnlistedSpaces(mySpaceIds)
      .then(setMyUnlistedSpaces)
      .catch((err) =>
        log.error('Failed to load unlisted spaces by account', address.toString(), err)
      )
  }, [ mySpaceIds.length, isMySpaces ])

  return {
    isLoading: !myUnlistedSpaces,
    myUnlistedSpaces: myUnlistedSpaces || []
  }
}

const SpacePreview = (space: SpaceData) =>
  <ViewSpace
    key={`space-${space.struct.id.toString()}`}
    spaceData={space}
    withFollowButton
    preview
  />

const PublicSpaces = (props: LoadSpacesProps) => {
  const { spacesData, mySpaceIds, address, withTitle } = props
  const totalCount = mySpaceIds?.length
  const noSpaces = totalCount === 0
  const isMy = isMyAddress(address)

  const title = withTitle
    ? <span className='d-flex justify-content-between align-items-center w-100 my-2'>
      <span>{`Public Spaces (${totalCount})`}</span>
      {!noSpaces && isMy && <CreateSpaceButton />}
    </span>
    : null

  return <PaginatedList
    title={title}
    totalCount={totalCount}
    dataSource={spacesData}
    renderItem={SpacePreview}
    noDataDesc='No public spaces found'
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

export const AccountSpaces = ({ spacesData, mySpaceIds, withTitle = true, ...props}: Props) => {
  const state = mySpaceIds && spacesData
    ? { withTitle, spacesData, mySpaceIds, ...props } as LoadSpacesProps
    : useLoadAccoutPublicSpaces(props.address, mySpaceIds)

  if (!state) return <Loading label='Loading public spaces'/>

  return <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <PublicSpaces {...state} />
      <UnlistedSpaces {...state} />
    </div>
}

export const AccountSpacesPage: NextPage<Props> = (props: Props) =>
  <PageContent 
    meta={{
      title: 'Account spaces',
      desc: `Subsocial spaces owned by ${props.address}`
    }}
  >
    <AccountSpaces {...props} />
  </PageContent>

AccountSpacesPage.getInitialProps = async (props): Promise<Props> => {
  const { query } = props
  const { address } = query

  if (!address || typeof address !== 'string') {
    return return404(props) as any
  }

  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial
  const mySpaceIds = await substrate.spaceIdsByOwner(address)
  const pageIds = getPageOfIds(mySpaceIds, query)
  const spacesData = await subsocial.findPublicSpaces(pageIds)

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

export default AccountSpacesPage
