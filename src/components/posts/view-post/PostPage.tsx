import React from 'react'
import { DfMd } from '../../utils/DfMd'
import Section from '../../utils/Section'
import { asCommentStruct, bnsToIds, idToBn, PostData, PostWithAllDetails } from 'src/types'
import ViewTags from '../../utils/ViewTags'
import ViewPostLink from '../ViewPostLink'
import { CommentSection } from '../../comments/CommentsSection'
import { PostDropDownMenu, PostCreator, HiddenPostAlert, PostActionsPanel, SharePostContent, isUnlistedPost, PostNotFound } from './helpers'
import { NextPage } from 'next'
import { PageContent } from 'src/components/main/PageWrapper'
import { Loading } from 'src/components/utils'
import { isUnlistedSpace } from 'src/components/spaces/helpers'
import { resolveIpfsUrl } from 'src/ipfs'
import { useResponsiveSize } from 'src/components/responsive'
import { ViewSpace } from 'src/components/spaces/ViewSpace'
import { getPostIdFromSlug } from '../slugify'
import { postUrl, spaceUrl } from 'src/components/urls'
import { return404 } from 'src/components/utils/next'
import { getInitialPropsWithRedux, NextContextWithRedux } from 'src/rtk/app'
import { fetchPost, fetchPosts, selectPost } from 'src/rtk/features/posts/postsSlice'
import { StatsPanel } from '../PostStats'
import { useAppSelector } from 'src/rtk/app/store'
import { PostWithSomeDetails } from 'src/types'
import { useFetchMyReactionsByPostIds } from 'src/rtk/features/reactions/myPostReactionsHooks'

export type PostDetailsProps = {
  postData: PostWithAllDetails,
  rootPostData?: PostWithSomeDetails
  statusCode?: number
}

export const PostPage: NextPage<PostDetailsProps> = (props) => {
  const { postData: initialPostData, rootPostData } = props
  const id = initialPostData.id
  const { isNotMobile } = useResponsiveSize()

  // TODO use useFetchMyReactionByPostId ?
  useFetchMyReactionsByPostIds([ id ])

  const postData = useAppSelector(state => selectPost(state, { id })) || initialPostData

  // TODO subscribe to post update
  // const struct = useSubscribedPost(initStruct)

  // const postDetails: PostWithSomeDetails = {
  //   ...initialPost,
  //   post: { id: struct.id, struct, content }
  // }

  // const spaceData = useLoadUnlistedSpace(struct.ownerId).myHiddenSpace

  // if (statusCode === 404) {
  //   return <Error statusCode={statusCode} />
  // }

  const { post, space } = postData
  const { struct, content } = post

  if (isUnlistedSpace(postData.space) || isUnlistedPost(postData.post)) return <PostNotFound />

  if (!content) return null

  if (!space) return <Loading />

  const spaceStruct = space.struct
  const spaceData = space

  const { title, body, image, tags } = content

  const goToCommentsId = 'comments'

  const renderResponseTitle = (parentPost?: PostData) => parentPost && <>
      In response to{' '}
    <ViewPostLink space={spaceStruct} post={parentPost} title={parentPost.content?.title} />
  </>

  const titleMsg = struct.isComment
    ? renderResponseTitle(rootPostData?.post)
    : title

  return <PageContent
    meta={{ 
      title,
      desc: content.summary,
      image,
      tags,
      canonical: postUrl(spaceStruct, postData.post),
      externalCanonical: content.canonical
    }}
  >
    <HiddenPostAlert post={post.struct} />
    <Section className='DfContentPage DfEntirePost'> {/* TODO Maybe delete <Section /> because <PageContent /> includes it */}
      <div className='DfRow'>
        <h1 className='DfPostName'>{titleMsg}</h1>
        <PostDropDownMenu post={post} space={spaceStruct} withEditButton />
      </div>

      <div className='DfRow'>
        <PostCreator postDetails={postData} withSpaceName space={spaceData} />
        {isNotMobile && <StatsPanel post={struct} goToCommentsId={goToCommentsId} />}
      </div>

      <div className='DfPostContent'>
        {struct.isSharedPost
          ? <SharePostContent postDetails={postData} space={space} />
          : <>
            {image && <div className='d-flex justify-content-center'>
              <img src={resolveIpfsUrl(image)} className='DfPostImage' /* add onError handler */ />
            </div>}
            {body && <DfMd source={body} />}
            <ViewTags tags={tags} className='mt-2' />
          </>}
      </div>
      
      <div className='DfRow'>
        <PostActionsPanel postDetails={postData} space={space.struct} />
      </div>

      <div className='DfSpacePreviewOnPostPage'>
        <ViewSpace
          spaceData={spaceData}
          withFollowButton
          withTags={false}
          withStats={false}
          preview
        />
      </div>

      <CommentSection post={postData} hashId={goToCommentsId} space={spaceStruct} />
    </Section>
  </PageContent>
}

export async function loadPostOnNextReq (
  { context, dispatch, subsocial, reduxStore }: NextContextWithRedux
): Promise<PostWithSomeDetails> {
  const { query: { spaceId, slug }, res } = context

  const { substrate } = subsocial

  const spaceIdOrHandle = spaceId as string
  const slugStr = slug as string
  const postId = getPostIdFromSlug(slugStr)

  if (!postId) return return404(context)

  const replyIds = await substrate.getReplyIdsByPostId(idToBn(postId))

  const ids = bnsToIds(replyIds).concat(postId)

  await dispatch(fetchPosts({ api: subsocial, ids, reload: true }))
  const postData = selectPost(reduxStore.getState(), { id: postId })

  if (!postData?.space) return return404(context)

  const { space, post } = postData

  const hasHandle = spaceIdOrHandle.startsWith('@')
  const currentSpace = (hasHandle
    ? { handle: spaceIdOrHandle }
    : { id: spaceIdOrHandle }
  )
    
  const currentPostUrl = spaceUrl(currentSpace, slugStr)
  const validPostUrl = postUrl(space, post)

  if (currentPostUrl !== validPostUrl && res) {
    res.writeHead(301, { Location: postUrl(space, post) })
    res.end()
  }

  return postData
}

getInitialPropsWithRedux(PostPage, async (props) => {
  const { subsocial, dispatch, reduxStore } = props
  
  const postData = await loadPostOnNextReq(props)

  let rootPostData: PostWithSomeDetails | undefined

  const postStruct = postData.post.struct

  if (postStruct.isComment) {
    const { rootPostId } = asCommentStruct(postStruct)
    await dispatch(fetchPost({ api: subsocial, id: rootPostId, reload: true }))
    rootPostData = selectPost(reduxStore.getState(), { id: rootPostId })
  }

  return {
    postData: postData as PostWithAllDetails,
    rootPostData
  }
})

export default PostPage
