import { getSpaceId } from 'src/components/substrate'
import { slugifyHandle } from 'src/components/urls/helpers'
import { return404 } from 'src/components/utils/next'
import { NextContextWithRedux } from 'src/rtk/app'
import { fetchSpace, selectSpace } from 'src/rtk/features/spaces/spacesSlice'
import { SpaceStruct, SpaceWithSomeDetails } from 'src/types'

export async function loadSpaceOnNextReq (
  props: NextContextWithRedux,
  getCanonicalUrl: (space: SpaceStruct) => string
): Promise<SpaceWithSomeDetails> {

  const { context, subsocial, dispatch, reduxStore } = props
  const { query, res } = context
  const { spaceId } = query
  const idOrHandle = spaceId as string

  // TODO use redux
  const id = await getSpaceId(idOrHandle)
  if (!id) {
    return return404(context)
  }

  const idStr = id.toString()
  await dispatch(fetchSpace({ api: subsocial, id: idStr, reload: true }))
  const spaceData = selectSpace(reduxStore.getState(), { id: idStr })

  if (!spaceData) {
    return return404(context)
  }

  const { struct } = spaceData
  const handle = slugifyHandle(struct.handle)

  if (handle && handle !== idOrHandle && res) {
    res.writeHead(301, { Location: getCanonicalUrl(struct) })
    res.end()
  }

  return spaceData
}
