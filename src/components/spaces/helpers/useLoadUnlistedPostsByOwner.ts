import { PostWithSomeDetails } from 'src/types'
import { AnyAccountId } from '@subsocial/types/substrate'
import { PostId } from 'src/types'
import { useState } from 'react'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { isMyAddress } from 'src/components/auth/MyAccountContext'
import { newLogger } from '@subsocial/utils'

type Props = {
  owner: AnyAccountId
  postIds: PostId[]
}

const log = newLogger(useLoadUnlistedPostsByOwner.name)

// TODO use redux
export function useLoadUnlistedPostsByOwner ({ owner, postIds }: Props) {
  const isMySpaces = isMyAddress(owner)
  const [ myHiddenPosts, setMyHiddenPosts ] = useState<PostWithSomeDetails[]>()

  useSubsocialEffect(({ flatApi }) => {
    let isMounted = true

    if (!isMySpaces) return setMyHiddenPosts([])

    flatApi.findUnlistedPostsWithAllDetails(postIds)
      .then(res => isMounted && setMyHiddenPosts(res))
      .catch(err => log.error(
        'Failed to get unlisted posts with all details by ids:', postIds, err))

    return () => { isMounted = false }
  }, [ postIds.length, isMySpaces ])

  return {
    isLoading: !myHiddenPosts,
    myHiddenPosts: myHiddenPosts || []
  }
}
