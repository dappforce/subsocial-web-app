import React, { FC, useState } from 'react'
import BN from 'bn.js'
import { Loading } from '../utils'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { PostWithAllDetails } from 'src/types'
import PostPreview from './view-post/PostPreview'

type OuterProps = {
  postIds: BN[]
}

type ResolvedProps = {
  posts: PostWithAllDetails[]
}

export function withLoadPostsWithSpaces<P extends OuterProps> (Component: React.ComponentType<ResolvedProps>) {
  return function (props: P) {
    const { postIds } = props
    const [ posts, setPosts ] = useState<PostWithAllDetails[]>()
    const [ loaded, setLoaded ] = useState(false)

    useSubsocialEffect(({ flatApi }) => {
      let isMounted = true

      const loadData = async () => {
        const extPostData = await flatApi.findPublicPostsWithAllDetails(postIds)
        if (isMounted) {
          extPostData && setPosts(extPostData)
          setLoaded(true)
        }
      }

      loadData().catch(console.warn)

      return () => { isMounted = false }
    }, [])

    return loaded && posts
      ? <Component posts={posts} />
      : <Loading />
  }
}

const InnerPostPreviewList: FC<ResolvedProps> = ({ posts }) =>
  <>{posts.map(x => <PostPreview key={x.post.id} postDetails={x} withActions />)}</>

export const PostPreviewList = withLoadPostsWithSpaces(InnerPostPreviewList)
