import React from 'react'
import dynamic from 'next/dynamic'
import { DfMd } from '../../utils/DfMd'
import Section from '../../utils/Section'
import { idToBn, PostData, PostWithAllDetails, PostWithSomeDetails, SpaceStruct } from 'src/types'
import ViewTags from '../../utils/ViewTags'
import ViewPostLink from '../ViewPostLink'
import { CommentSection } from '../../comments/CommentsSection'
import { PostDropDownMenu, PostCreator, HiddenPostAlert, PostNotFound, PostActionsPanel, isComment, SharePostContent, useSubscribedPost } from './helpers'
import Error from 'next/error'
import { NextPage } from 'next'
import { getSubsocialApi } from 'src/components/utils/SubsocialConnect'
import { newFlatApi } from 'src/components/substrate'
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
import { return404 } from 'src/components/utils/next'

const StatsPanel = dynamic(() => import('../PostStats'), { ssr: false })

export type PostDetailsProps = {
  postDetails: PostWithAllDetails,
  statusCode?: number,
  replies: PostWithAllDetails[]
}

export const PostPage: NextPage<PostDetailsProps> = (props) => {
  const { postDetails: initialPost, replies, statusCode } = props

  if (statusCode === 404) {
    return <Error statusCode={statusCode} />
  }

  if (!initialPost || isHidden({ struct: initialPost.post.struct })) {
    return <PostNotFound />
  }

  const { post, ext, space } = initialPost

  if (!space || isHiddenSpace(space.struct)) {
    return <PostNotFound />
  }

  const { struct: initStruct, content } = post

  if (!content) return null

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // TODO REFACTOR THIS! HOOKS CANNOT GO AFTER IF-ELSE
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  const { isNotMobile } = useResponsiveSize()
  const struct = useSubscribedPost(initStruct)

  const postDetails: PostWithSomeDetails = {
    ...initialPost,
    post: { id: struct.id, struct, content }
  }

  const spaceData = space || postDetails.space || useLoadUnlistedSpace(struct.ownerId).myHiddenSpace

  if (!spaceData) return <Loading />

  const spaceStruct = spaceData.struct

  const { title, body, image, tags } = content
  const canonical = content.canonical || postUrl(spaceStruct, postDetails.post)

  const goToCommentsId = 'comments'

  const renderResponseTitle = (parentPost?: PostData) => parentPost && <>
      In response to{' '}
    <ViewPostLink space={spaceStruct} post={parentPost} title={parentPost.content?.title} />
  </>

  const titleMsg = struct.isComment
    ? renderResponseTitle(postDetails.ext?.post)
    : title

  return <PageContent
    meta={{ 
      title,
      desc: mdToText(body),
      image,
      tags,
      canonical,
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
  const flatApi = newFlatApi(subsocial)
  const { substrate } = subsocial

  const idOrHandle = spaceId as string
  const slugStr = slug as string
  const postId = getPostIdFromSlug(slugStr)

  if (!postId) return return404(props)

  const replyIds = await substrate.getReplyIdsByPostId(idToBn(postId))
  const comments = await flatApi.findPublicPostsWithAllDetails([ ...replyIds, postId ])

  const [ extPostsData, replies ] = partition(comments, x => x.post.id === postId)
  const extPostData = extPostsData.pop() || await flatApi.findPostWithAllDetails(postId)

  const spaceIdFromPost = extPostData?.post.struct.spaceId
  const currentSpace = { id: spaceIdFromPost, handle: idOrHandle } as unknown as SpaceStruct
  const currentPostUrl = spaceUrl(currentSpace, slugStr)

  const space = extPostData?.space.struct || currentSpace
  const post = { struct: { id: postId }, content: extPostData?.post.content }
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
