import { AnyAccountId } from '@subsocial/types'
import { SpaceId } from '@subsocial/types/substrate/interfaces'
import { newLogger } from '@subsocial/utils'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import PaginatedList from 'src/components/lists/PaginatedList'
import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_SIZE } from 'src/config/ListData.config'
import { SpaceData } from 'src/types'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { isMyAddress, useMyAddress } from '../auth/MyAccountContext'
import DataList from '../lists/DataList'
import { PageContent } from '../main/PageWrapper'
import { newFlatApi } from '../substrate'
import { Loading } from '../utils'
import { getPageOfIds } from '../utils/getIds'
import { return404 } from '../utils/next'
import { getSubsocialApi } from '../utils/SubsocialConnect'
import { CreateSpaceButton } from './helpers'
import { SpacePreview } from './SpacePreview'

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
  const [ loaded, setLoaded ] = useState(false)

  const page = query.page || DEFAULT_FIRST_PAGE
  const size = query.size || DEFAULT_PAGE_SIZE

  const spacesCount = mySpaceIds.length

  useSubsocialEffect(({ substrate }) => {
    if (spacesCount && loaded) return

    let isMounted = true

    const loadSpaceIds = async () => {
      const mySpaceIds = await substrate.spaceIdsByOwner(address)
      if (isMounted) {
        setSpaceIds(mySpaceIds.reverse())
        setLoaded(true)
      }
    }

    loadSpaceIds().catch((err) => log.error(
      'Failed to load space ids by account', address.toString(), err))

    return () => { isMounted = false }
  }, [ address.toString() ])

  useSubsocialEffect(({ flatApi }) => {
    let isMounted = true

    if (!spacesCount) return

    const loadSpaces = async () => {
      const pageIds = getPageOfIds(mySpaceIds, query)
      const spacesData = await flatApi.findPublicSpaces(pageIds)
      isMounted && setSpacesData(spacesData)
    }

    loadSpaces().catch((err) =>
      log.error('Failed to load spaces by account', address.toString(), err)
    )

    return () => { isMounted = false }
  }, [ address.toString(), spacesCount, page, size ])

  if (!spacesData.length && !loaded) return undefined

  return {
    spacesData,
    mySpaceIds,
    address
  }
}

const useLoadUnlistedSpaces = ({ address, mySpaceIds }: LoadSpacesProps) => {
  const isMySpaces = isMyAddress(address)
  const [ myUnlistedSpaces, setMyUnlistedSpaces ] = useState<SpaceData[]>()

  useSubsocialEffect(({ flatApi }) => {
    let isMounted = true

    if (!isMySpaces) return setMyUnlistedSpaces([])

    flatApi.findUnlistedSpaces(mySpaceIds)
      .then((res) => isMounted && setMyUnlistedSpaces(res))
      .catch((err) =>
        log.error('Failed to load unlisted spaces by account', address.toString(), err)
      )
    
    return () => { isMounted = false }
  }, [ mySpaceIds.length, isMySpaces ])

  return {
    isLoading: !myUnlistedSpaces,
    myUnlistedSpaces: myUnlistedSpaces || []
  }
}

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
    getKey={item => item.id}
    renderItem={item => <SpacePreview space={item} />}
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

  const unlistedCount = myUnlistedSpaces.length
  if (!unlistedCount) return null

  return (
    <DataList
      title={`Unlisted Spaces (${unlistedCount})`}
      dataSource={myUnlistedSpaces}
      getKey={item => item.id}
      renderItem={item => <SpacePreview space={item} />}
    />
  )
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

// TODO this page is not required for SEO
AccountSpacesPage.getInitialProps = async (props): Promise<Props> => {
  const { query } = props
  const { address } = query

  if (!address || typeof address !== 'string') { 
    return return404(props) as any
  }

  const subsocial = await getSubsocialApi()
  const flatApi = newFlatApi(subsocial)
  const { substrate } = subsocial

  const mySpaceIds = await substrate.spaceIdsByOwner(address)
  const pageIds = getPageOfIds(mySpaceIds, query)
  const spacesData = await flatApi.findPublicSpaces(pageIds)

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
