import BN from 'bn.js'
import React, { FC } from 'react'
import { SpaceId, SpaceWithSomeDetails } from 'src/types'
import { useFetchSpaces } from 'src/rtk/app/hooks'
import { fetchSpaces } from 'src/rtk/features/spaces/spacesSlice'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import { stringifyBns } from 'src/utils'
import { PaginatedList } from '../lists/PaginatedList'
import { PageContent } from '../main/PageWrapper'
import { approxCountOfPublicSpaces, getReversePageOfSpaceIds } from '../utils/getIds'
import { CreateSpaceButton } from './helpers'
import { ViewSpace } from './ViewSpace'
import { Loading } from '../utils'

const getTitle = (count: number | BN) => `Explore Spaces (${count})`

type PreviewProps = {
  space: SpaceWithSomeDetails
}

const SpacePreview = React.memo(({ space }: PreviewProps) =>
  <ViewSpace
    spaceData={space}
    withFollowButton
    preview
  />
)

type Props = {
  spaceIds: SpaceId[]
  totalSpaceCount?: number
}

export const ListAllSpaces = (props: Props) => {
  const { spaceIds, totalSpaceCount = 0 } = props
  const title = getTitle(totalSpaceCount)
  const { entities: spacesData, loading } = useFetchSpaces({ ids: spaceIds })

  if (loading) return <Loading label='Loading spaces' />

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <PaginatedList
        title={title}
        totalCount={totalSpaceCount}
        dataSource={spacesData}
        noDataDesc='There are no spaces yet'
        noDataExt={<CreateSpaceButton />}
        getKey={item => item.id}
        renderItem={(item) => <SpacePreview space={item} />}
      />
    </div>
  )
}

const ListAllSpacesPage: FC<Props> = (props) => {
  const { totalSpaceCount = 0 } = props
  const title = getTitle(totalSpaceCount)

  return <PageContent
    meta={{
      title,
      desc: 'Discover and follow interesting spaces on Subsocial.',
      canonical: '/spaces'
    }}>
    <ListAllSpaces {...props} />
  </PageContent>
}

getInitialPropsWithRedux(ListAllSpacesPage, async ({ context, subsocial, dispatch }) => {
  const { query } = context
  const { substrate } = subsocial

  // TODO use redux
  const nextSpaceId = await substrate.nextSpaceId()
  const spaceIds = stringifyBns(await getReversePageOfSpaceIds(nextSpaceId, query))

  // TODO fetch only public spaces!
  await dispatch(fetchSpaces({ api: subsocial, ids: spaceIds, withOwner: false, /* TODO visibility: 'public' */ }))
  const totalSpaceCount = approxCountOfPublicSpaces(nextSpaceId).toNumber()

  return { spaceIds, totalSpaceCount }
})

export default ListAllSpacesPage
