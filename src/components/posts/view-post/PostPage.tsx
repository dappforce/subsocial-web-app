import React from 'react'
import dynamic from 'next/dynamic'
import { DfMd } from '../../utils/DfMd'
import Section from '../../utils/Section'
import { bnsToIds, idToBn, PostData, PostWithAllDetails } from 'src/types'
import ViewTags from '../../utils/ViewTags'
import ViewPostLink from '../ViewPostLink'
import { CommentSection } from '../../comments/CommentsSection'
import { PostDropDownMenu, PostCreator, HiddenPostAlert, PostActionsPanel, SharePostContent, isUnlistedPost } from './helpers'
import { NextPage } from 'next'
import { PageContent } from 'src/components/main/PageWrapper'
import { Loading } from 'src/components/utils'
import { isUnlistedSpace } from 'src/components/spaces/helpers'
import { resolveIpfsUrl } from 'src/ipfs'
import { useResponsiveSize } from 'src/components/responsive'
import { mdToText } from 'src/utils'
import { ViewSpace } from 'src/components/spaces/ViewSpace'
import { getPostIdFromSlug } from '../slugify'
import { postUrl, spaceUrl } from 'src/components/urls'
import { return404 } from 'src/components/utils/next'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import { fetchPosts, selectPost } from 'src/rtk/features/posts/postsSlice'

const StatsPanel = dynamic(() => import('../PostStats'), { ssr: false })

export type PostDetailsProps = {
  postData: PostWithAllDetails,
  statusCode?: number
}

export const PostPage: NextPage<PostDetailsProps> = (props) => {
  const { postData } = props

  const { isNotMobile } = useResponsiveSize()

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

  const { post, ext, space } = postData

  const { struct, content } = post

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
    ? renderResponseTitle(postData.ext?.post)
    : title

  return <PageContent
    meta={{ 
      title,
      desc: mdToText(body),
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
        {isNotMobile && <StatsPanel id={struct.id} goToCommentsId={goToCommentsId} />}
      </div>

      <div className='DfPostContent'>
        {ext
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

getInitialPropsWithRedux(PostPage, async ({ context, subsocial, dispatch, reduxStore }) => {
  const { query: { spaceId, slug }, res } = context

  const { substrate } = subsocial

  const spaceIdOrHandle = spaceId as string
  const slugStr = slug as string
  const postId = getPostIdFromSlug(slugStr)

  if (!postId) return return404(context)

  const replyIds = await substrate.getReplyIdsByPostId(idToBn(postId))

  const ids = bnsToIds(replyIds).concat(postId)

  await dispatch(fetchPosts({ api: subsocial, ids }))
  const postData = selectPost(reduxStore.getState(), { id: postId })

  if (!postData ||
    !postData.space ||
    isUnlistedSpace(postData.space) ||
    isUnlistedPost(postData.post)
  ) return return404(context)

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

  return {
    postData: postData as PostWithAllDetails,
  }
})

export default PostPage
