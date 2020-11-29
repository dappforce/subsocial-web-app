import { SpaceContent } from '@subsocial/types/offchain'
import React, { FC } from 'react'
import { resolveBn } from '../utils'
import { return404 } from '../utils/next'
import { getSpaceId } from '../substrate'
import { ViewSpaceProps } from './ViewSpaceProps'
import { PageContent } from '../main/PageWrapper'
import { SpaceNotFound, isUnlistedSpace } from './helpers'
import { getPageOfIds } from '../utils/getIds'
import { spaceUrl } from '../urls'
import { slugifyHandle } from '../urls/helpers'
import { isPolkaProject, stringifyBns } from 'src/utils'
import { withServerRedux } from 'src/rtk/app/withServerRedux'
import { fetchSpace, selectSpace } from 'src/rtk/features/spaces/spacesSlice'
import { fetchPosts, selectPosts } from 'src/rtk/features/posts/postsSlice'
import { ViewSpace } from './ViewSpace'

type Props = ViewSpaceProps

// TODO extract getInitialProps, this func is similar in AboutSpace

const ViewSpacePage: FC<Props> = (props) => {
  const { spaceData } = props

  if (isUnlistedSpace(spaceData)) {
    return <SpaceNotFound />
  }

  const id = resolveBn(spaceData.struct.id)
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

withServerRedux(ViewSpacePage, async ({ context, subsocial, dispatch, reduxStore }) => {
  const { query, res } = context
  const { spaceId } = query
  const idOrHandle = spaceId as string

  // TODO use redux
  const id = await getSpaceId(idOrHandle)
  if (!id) {
    return return404(context)
  }

  const idStr = id.toString()
  await dispatch(fetchSpace({ api: subsocial, id: idStr }))
  const spaceData = selectSpace(reduxStore.getState(), { id: idStr })

  if (!spaceData) {
    return return404(context)
  }

  const { struct, owner } = spaceData
  const handle = slugifyHandle(struct.handle)

  if (handle && handle !== idOrHandle && res) {
    res.writeHead(301, { Location: spaceUrl(struct) })
    res.end()
  }

  // We need to reverse post ids to display posts in a descending order on a space page.
  const postIds = (await subsocial.substrate.postIdsBySpaceId(id)).reverse()
  const pageIds = stringifyBns(getPageOfIds(postIds, query))

  await dispatch(fetchPosts({ api: subsocial, ids: pageIds }))
  const posts = selectPosts(reduxStore.getState(), { ids: pageIds })

  return {
    spaceData,
    posts,
    postIds: stringifyBns(postIds),
    owner
  }
})

export default ViewSpacePage
