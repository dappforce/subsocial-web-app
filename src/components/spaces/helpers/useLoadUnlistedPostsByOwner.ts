import { PostWithSomeDetails } from 'src/types'
import { AnyAccountId } from '@subsocial/types/substrate'
import { PostId } from '@subsocial/types/substrate/interfaces'
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

  useSubsocialEffect(({ subsocial }) => {
    if (!isMySpaces) return setMyHiddenPosts([])

    subsocial.findUnlistedPostsWithAllDetails(postIds)
      .then(setMyHiddenPosts)

  }, [ postIds.length, isMySpaces ])

  return {
    isLoading: !myHiddenPosts,
    myHiddenPosts: myHiddenPosts || []
  }
}
