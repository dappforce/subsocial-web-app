import React, { useEffect, useState } from 'react';
import BN from 'bn.js';
import ViewPostPage from '../posts/ViewPost';
import { Loading } from '../utils/utils';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { ExtendedPostData } from '@subsocial/types';

type LoadProps = {
  postIds: BN[]
}

type PostPreviewListProps = {
  posts: ExtendedPostData[]
}

type PostPreviewProps = {
  post: ExtendedPostData
}

export function withLoadFeed<P extends LoadProps> (Component: React.ComponentType<PostPreviewListProps>) {
  return function (props: P) {
    const { postIds } = props;
    const [ posts, setPosts ] = useState<ExtendedPostData[]>();
    const [ loaded, setLoaded ] = useState(false)
    const { subsocial } = useSubsocialApi()

    useEffect(() => {
      setLoaded(false)
      const loadData = async () => {
        const extPostData = await subsocial.findPostsWithDetails(postIds)
        extPostData && setPosts(extPostData)
        setLoaded(true)
      };

      loadData().catch(console.log);
    }, [ false ]);

    return loaded && posts ? <Component posts={posts} /> : <Loading />
  }
}

export const PostPreviewListView: React.FunctionComponent<PostPreviewListProps> = ({ posts }) =>
  <>{posts.map(x => <PostPreview post={x} />)}</>

export function PostPreview (props: PostPreviewProps) {
  const { post, ext, owner } = props.post

  return <ViewPostPage postData={post} postExtData={ext} owner={owner} variant='preview' withBlogName />
}

export const PostPreviewList = withLoadFeed(PostPreviewListView)

export default PostPreview
