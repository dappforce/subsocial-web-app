import React from 'react'
import dynamic from 'next/dynamic'
import { DfMd } from '../../utils/DfMd'
import Section from '../../utils/Section'
import { PostData, PostWithAllDetails } from '@subsocial/types/dto'
import ViewTags from '../../utils/ViewTags'
import ViewPostLink from '../ViewPostLink'
import { CommentSection } from '../../comments/CommentsSection'
import { PostDropDownMenu, PostCreator, HiddenPostAlert, PostNotFound, PostActionsPanel, isComment, SharePostContent, useSubscribedPost } from './helpers'
import Error from 'next/error'
import { NextPage } from 'next'
import { getSubsocialApi } from 'src/components/utils/SubsocialConnect'
import { unwrapSubstrateId } from 'src/components/substrate'
import partition from 'lodash.partition'
import { PageContent } from 'src/components/main/PageWrapper'
import { isHidden, Loading } from 'src/components/utils'
import { useLoadUnlistedSpace, isHiddenSpace } from 'src/components/spaces/helpers'
import { resolveIpfsUrl } from 'src/ipfs'
import { useResponsiveSize } from 'src/components/responsive'
import { mdToText } from 'src/utils'
import { ViewSpace } from 'src/components/spaces/ViewSpace'
import { getPostIdFromSlug } from '../slugify'
import { postUrl, spaceUrl } from 'src/components/urls'
import { PostId, Space, SpaceId } from '@subsocial/types/substrate/interfaces'
import { return404 } from 'src/components/utils/next'

const StatsPanel = dynamic(() => import('../PostStats'), { ssr: false })

export type PostDetailsProps = {
  postDetails: PostWithAllDetails,
  statusCode?: number,
  replies: PostWithAllDetails[]
}

export const PostPage: NextPage<PostDetailsProps> = ({ postDetails: initialPost, replies, statusCode }) => {
  if (statusCode === 404) return <Error statusCode={statusCode} />
  if (!initialPost || isHidden({ struct: initialPost.post.struct })) return <PostNotFound />

  const { post, ext, space } = initialPost

  if (!space || isHiddenSpace(space.struct)) return <PostNotFound />

  const { struct: initStruct, content } = post

  if (!content) return null

  const { isNotMobile } = useResponsiveSize()
  const struct = useSubscribedPost(initStruct)
  const postDetails = { ...initialPost, post: { struct, content } }

  const spaceData = space || postDetails.space || useLoadUnlistedSpace(struct.owner).myHiddenSpace

  if (!spaceData) return <Loading />

  const spaceStruct = spaceData.struct

  const { title, body, image, tags } = content

  const goToCommentsId = 'comments'

  const renderResponseTitle = (parentPost?: PostData) => parentPost && <>
      In response to{' '}
    <ViewPostLink space={spaceStruct} post={parentPost} title={parentPost.content?.title} />
  </>

  const titleMsg = isComment(struct.extension)
    ? renderResponseTitle(postDetails.ext?.post)
    : title

  return <PageContent
    meta={{ 
      title,
      desc: mdToText(body),
      image,
      tags,
      canonical: postUrl(spaceStruct, postDetails.post),
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
        <PostCreator postDetails={postDetails} withSpaceName space={spaceData} />
        {isNotMobile && <StatsPanel id={struct.id} goToCommentsId={goToCommentsId} />}
      </div>

      <div className='DfPostContent'>
        {ext
          ? <SharePostContent postDetails={postDetails} space={space} />
          : <>
            {image && <div className='d-flex justify-content-center'>
              <img src={resolveIpfsUrl(image)} className='DfPostImage' /* add onError handler */ />
            </div>}
            {body && <DfMd source={body} />}
            <ViewTags tags={tags} className='mt-2' />
          </>}
      </div>
      
      <div className='DfRow'>
        <PostActionsPanel postDetails={postDetails} space={space.struct} />
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

      <CommentSection post={postDetails} hashId={goToCommentsId} replies={replies} space={spaceStruct} />
    </Section>
  </PageContent>
}

PostPage.getInitialProps = async (props): Promise<any> => {
  const { query: { spaceId, slug }, res } = props

  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial
  const spaceIdOrHandle = spaceId as string

  const slugStr = slug as string
  const postId = getPostIdFromSlug(slugStr)

  if (!postId) return return404(props)

  const replyIds = await substrate.getReplyIdsByPostId(postId)
  const comments = await subsocial.findPublicPostsWithAllDetails([ ...replyIds, postId ])

  const [ extPostsData, replies ] = partition(comments, x => x.post.struct.id.eq(postId))
  const extPostData = extPostsData.pop() || await subsocial.findPostWithAllDetails(postId)

  const spaceIdFromPost = unwrapSubstrateId(extPostData?.post.struct.space_id) as SpaceId

  const hasHandle = spaceIdOrHandle.startsWith('@')
  const currentSpace = (hasHandle
    ? { id: spaceIdFromPost, handle: spaceIdOrHandle }
    : { id: spaceIdFromPost || spaceIdOrHandle}
  ) as unknown as Space
    
  const currentPostUrl = spaceUrl(currentSpace, slugStr)

  const space = extPostData?.space.struct || currentSpace
  const post = { struct: { id: postId as PostId }, content: extPostData?.post.content }
  const validPostUrl = postUrl(space, post)

  if (currentPostUrl !== validPostUrl && res) {
    res.writeHead(301, { Location: postUrl(space, post) })
    res.end()
  }

  return {
    postDetails: extPostData,
    replies
  }
}

export default PostPage
