import { NextPage } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import PaginatedList from 'src/components/lists/PaginatedList'
import { PageLink } from 'src/layout/SideMenuItems'
import { SpaceData } from 'src/types'
import { isMyAddress } from '../auth/MyAccountContext'
import { PageContent } from '../main/PageWrapper'
import { newFlatApi } from '../substrate'
import { spaceUrl } from '../urls'
import { toShortAddress } from '../utils'
import ButtonLink from '../utils/ButtonLink'
import BaseAvatar from '../utils/DfAvatar'
import { getPageOfIds } from '../utils/getIds'
import { getSubsocialApi } from '../utils/SubsocialConnect'
import { ViewSpace } from './ViewSpace'

type Props = {
  spacesData: SpaceData[],
  totalCount: number
};

export const ListFollowingSpaces = (props: Props) => {
  const { spacesData, totalCount } = props
  const { query: { address: queryAddress } } = useRouter()
  const address = queryAddress as string

  const title = isMyAddress(address)
    ? `My Subscriptions (${totalCount})`
    // TODO Improve a title: username | extension name | short addresss
    : `Subscriptions of ${toShortAddress(address)}`

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <PaginatedList
        title={title}
        totalCount={totalCount}
        dataSource={spacesData}
        getKey={item => item.id}
        renderItem={(item) => (
          <ViewSpace {...props} spaceData={item} preview withFollowButton />
        )}
        noDataDesc='You are not following any space yet'
        noDataExt={
          <ButtonLink href='/spaces' as='/spaces'>
            Explore spaces
          </ButtonLink>
        }
      />
    </div>
  )
}

export const ListFollowingSpacesPage: NextPage<Props> = (props) => {
  const { query: { address } } = useRouter()
  return <PageContent
    meta={{
      title: `Subscriptions of ${address}`,
      desc: `Spaces that ${address} follows on Subsocial`
    }}
  >
    <ListFollowingSpaces {...props} />
  </PageContent>
}

// TODO this page is not required for SEO
ListFollowingSpacesPage.getInitialProps = async (props): Promise<Props> => {
  const { query } = props
  const address = query.address as string

  const subsocial = await getSubsocialApi()
  const flatApi = newFlatApi(subsocial)
  const { substrate } = subsocial

  // TODO sort space ids in a desc order (don't forget to sort by id.toString())
  const followedSpaceIds = await substrate.spaceIdsFollowedByAccount(address)
  const pageIds = getPageOfIds(followedSpaceIds, query)
  const spacesData = await flatApi.findPublicSpaces(pageIds)

  return {
    totalCount: followedSpaceIds.length,
    spacesData
  }
}

export const buildFollowedItems = (followedSpacesData: SpaceData[]): PageLink[] =>
  followedSpacesData.map(({ struct, content }) => ({
    name: content?.name || '',
    page: [ '/[spaceId]', spaceUrl(struct) ],
    icon: <span className='SpaceMenuIcon'>
      <BaseAvatar address={struct.ownerId} avatar={content?.image} size={24} />
    </span>
  }))
