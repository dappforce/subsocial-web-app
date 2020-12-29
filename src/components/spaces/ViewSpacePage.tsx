import { SpaceContent } from '@subsocial/types/offchain'
import React, { FC } from 'react'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import { fetchPosts, selectPosts } from 'src/rtk/features/posts/postsSlice'
import { bnsToIds, idToBn } from 'src/types'
import { isPolkaProject } from 'src/utils'
import { PageContent } from '../main/PageWrapper'
import { spaceUrl } from '../urls'
import { getPageOfIds } from '../utils/getIds'
import { isUnlistedSpace, SpaceNotFound } from './helpers'
import { loadSpaceOnNextReq } from './helpers/loadSpaceOnNextReq'
import { ViewSpace } from './ViewSpace'
import { ViewSpaceProps } from './ViewSpaceProps'
import Error from 'next/error'

type Props = ViewSpaceProps

const ViewSpacePage: FC<Props> = (props) => {
  const { statusCode, spaceData } = props

  // TODO copypasta, see AboutSpacePage
  if (statusCode === 404) {
    return <Error statusCode={statusCode} />
  }

  if (isUnlistedSpace(spaceData)) {
    return <SpaceNotFound />
  }

  const id = idToBn(spaceData.struct.id)
  const { name, image } = spaceData.content as SpaceContent

  // We add this to a title to improve SEO of Polkadot projects.
  const title = name + (isPolkaProject(id) ? ' - Polkadot ecosystem projects' : '')

  return <PageContent
    meta={{
      title,
      desc: `Latest news and updates from ${name} on Subsocial.`,
      image,
      canonical: spaceUrl(spaceData.struct)
    }}
  >
    <ViewSpace {...props} />
  </PageContent>
}

getInitialPropsWithRedux(ViewSpacePage, async (props) => {
  const { context, subsocial, dispatch, reduxStore } = props
  const { query } = context

  const spaceData = await loadSpaceOnNextReq(props, spaceUrl)
  const spaceId = idToBn(spaceData.id)

  // We need to reverse post ids to display posts in a descending order on a space page.
  const postIds = (await subsocial.substrate.postIdsBySpaceId(spaceId)).reverse()
  const pageIds = bnsToIds(getPageOfIds(postIds, query))

  await dispatch(fetchPosts({ api: subsocial, ids: pageIds, reload: true }))
  const posts = selectPosts(reduxStore.getState(), { ids: pageIds })

  return {
    spaceData,
    posts,
    postIds: bnsToIds(postIds),
  }
})

export default ViewSpacePage
