import { PostWithSomeDetails } from 'src/types'
import { AnyAccountId } from '@subsocial/types/substrate'
import { PostId } from 'src/types'
import { useState } from 'react'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { isMyAddress } from 'src/components/auth/MyAccountContext'

type Props = {
  owner: AnyAccountId
  postIds: PostId[]
}

// TODO use redux
export const useLoadUnlistedPostsByOwner = ({ owner, postIds }: Props) => {
  const isMySpaces = isMyAddress(owner)
  const [ myHiddenPosts, setMyHiddenPosts ] = useState<PostWithSomeDetails[]>()

  useSubsocialEffect(({ flatApi }) => {
    if (!isMySpaces) return setMyHiddenPosts([])

    flatApi.findUnlistedPostsWithAllDetails(postIds)
      .then(setMyHiddenPosts)

  }, [ postIds.length, isMySpaces ])

  return {
    isLoading: !myHiddenPosts,
    myHiddenPosts: myHiddenPosts || []
  }
}
