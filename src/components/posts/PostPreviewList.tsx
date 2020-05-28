import React, { useEffect, useState } from 'react';
import BN from 'bn.js';
import { Loading } from '../utils/utils';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { ExtendedPostData } from '@subsocial/types';
import PostPreview from './PostPreview';

type OuterProps = {
  postIds: BN[]
}

type ResolvedProps = {
  posts: ExtendedPostData[]
}

export function withLoadPostsWithBlogs<P extends OuterProps> (Component: React.ComponentType<ResolvedProps>) {
  return function (props: P) {
    const { postIds } = props
    const [ posts, setPosts ] = useState<ExtendedPostData[]>()
    const [ loaded, setLoaded ] = useState(false)
    const { subsocial } = useSubsocialApi()

    useEffect(() => {
      setLoaded(false)
      const loadData = async () => {
        const extPostData = await subsocial.findPostsWithAllDetails(postIds)
        extPostData && setPosts(extPostData)
        setLoaded(true)
      };

      loadData().catch(console.log)
    }, [ false ])

    return loaded && posts ? <Component posts={posts} /> : <Loading />
  }
}

const InnerPostPreviewList: React.FunctionComponent<ResolvedProps> = ({ posts }) =>
  <>{posts.map(x => <PostPreview key={x.post.struct.id.toString()} post={x} />)}</>

export const PostPreviewList = withLoadPostsWithBlogs(InnerPostPreviewList)
