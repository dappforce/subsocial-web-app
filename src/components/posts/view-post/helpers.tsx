import React, { FC, useState } from 'react'
import Link from 'next/link'
import { isEmptyObj, isEmptyStr } from '@subsocial/utils'
import { formatDate, IconWithLabel, isHidden, isVisible } from '../../utils'
import { SpaceNameAsLink } from '../../spaces/ViewSpace'
import { DfBgImageLink } from '../../utils/DfBgImg'
import isEmpty from 'lodash.isempty'
import { EditOutlined, EllipsisOutlined, MessageOutlined } from '@ant-design/icons'
import { Menu, Dropdown, Button } from 'antd'
import { isMyAddress } from '../../auth/MyAccountContext'
import { PostId } from '@subsocial/types/substrate/interfaces'
import { SpaceData, PostWithSomeDetails, PostWithAllDetails, PostData, SpaceStruct, PostStruct, idToPostId } from 'src/types'
import ViewTags from '../../utils/ViewTags'
import AuthorPreview from '../../profiles/address-views/AuthorPreview'
import { SummarizeMd } from '../../utils/md/SummarizeMd'
import ViewPostLink from '../ViewPostLink'
import HiddenPostButton from '../HiddenPostButton'
import NoData from 'src/components/utils/EmptyList'
import { VoterButtons } from 'src/components/voting/VoterButtons'
import Segment from 'src/components/utils/Segment'
import { RegularPreview } from '.'
import { PostVoters, ActiveVoters } from 'src/components/voting/ListVoters'
import { resolveIpfsUrl } from 'src/ipfs'
import { useIsMobileWidthOrDevice } from 'src/components/responsive'
import { postUrl, editPostUrl, HasDataForSlug } from 'src/components/urls'
import { ShareDropdown } from '../share/ShareDropdown'
import { ButtonLink } from 'src/components/utils/ButtonLink'
import { DfMd } from 'src/components/utils/DfMd'
import { EntityStatusProps, HiddenEntityPanel } from 'src/components/utils/EntityStatusPanels'

type DropdownProps = {
  space: SpaceStruct
  post: PostData
  withEditButton?: boolean
}

export const isUnlistedPost = (data?: PostData): data is undefined => 
  !data || !data.struct || isHidden({ struct: data.struct })

type ReactionModalProps = {
  postId: PostId
}

const ReactionModal = ({ postId }: ReactionModalProps) => {
  const [ open, setOpen ] = useState(false)

  return <>
    <span onClick={() => setOpen(true)}>View reactions</span>
    <PostVoters id={postId} active={ActiveVoters.All} open={open} close={() => setOpen(false)} />
  </>
}

export const PostDropDownMenu: FC<DropdownProps> = (props) => {
  const { space, post, withEditButton = false } = props
  const { struct } = post
  const isMyPost = isMyAddress(struct.ownerId)
  const postId = struct.id

  const editPostProps = {
    href: '/[spaceId]/[slug]/edit',
    as: editPostUrl(space, post)
  }

  const menu = (
    <Menu>
      {isMyPost && <Menu.Item key={`edit-${postId}`}>
        <Link {...editPostProps}>
          <a className='item'>Edit post</a>
        </Link>
      </Menu.Item>}
      {isMyPost && <Menu.Item key={`hidde-${postId}`}>
        <HiddenPostButton post={struct} asLink />
      </Menu.Item>}
      <Menu.Item key={`view-reactions-${postId}`} >
        <ReactionModal postId={idToPostId(postId)} />
      </Menu.Item>
      {/* {edit_history.length > 0 && <Menu.Item key={`edit-history-${postId}`}>
          <div onClick={() => setOpen(true)} >View edit history</div>
        </Menu.Item>} */}
    </Menu>
  )

  return <div className='text-nowrap'>
    <Dropdown overlay={menu} placement='bottomRight' className='mx-2'>
      <EllipsisOutlined />
    </Dropdown>
    {withEditButton && isMyPost &&
      <ButtonLink {...editPostProps} className='bg-transparent'>
        <EditOutlined /> Edit
      </ButtonLink>
    }
    {/* open && <PostHistoryModal id={id} open={open} close={close} /> */}
  </div>
}

type HiddenPostAlertProps = EntityStatusProps & {
  post: PostStruct
}

export const HiddenPostAlert = (props: HiddenPostAlertProps) => {
  const { post } = props
  const kind = post.isComment ? 'comment' : 'post'
  const PostAlert = () => <HiddenEntityPanel struct={post} type={kind} {...props} />

  // TODO fix view Space alert when space is hidden
  // const SpaceAlert = () => space && !isOnlyVisible(space.struct)
    // ? <HiddenEntityPanel preview={preview} struct={space.struct} type='space' desc='This post is not visible because its space is hidden.' />
    // : null

  return <PostAlert />
}

type BlackPostLinkProps = {
  space: SpaceStruct
  post: HasDataForSlug
  title?: string
}

const BlackPostLink = ({ space, post, title }: BlackPostLinkProps) =>
  <ViewPostLink space={space} post={post} title={title} className='DfBlackLink' />

type PostNameProps = {
  post: PostWithSomeDetails,
  withLink?: boolean
}

export const PostName: FC<PostNameProps> = React.memo(({ post: postDetails, withLink }) => {
  const { space, post } = postDetails
  const { content: { title } = {} } = post

  if (!post.struct || !space || isEmptyStr(title)) return null

  return (
    <div className={'header DfPostTitle--preview'}>
      {withLink
        ? <BlackPostLink space={space.struct} post={post} title={title} />
        : title}
    </div>
  )
})

type PostCreatorProps = {
  postDetails: PostWithSomeDetails,
  withSpaceName: boolean,
  space?: SpaceData
  size?: number,
}

export const PostCreator: FC<PostCreatorProps> = ({ postDetails, size, withSpaceName, space }) => {
  if (isEmpty(postDetails.post)) return null

  const { post, owner } = postDetails
  const { createdAtTime, ownerId } = post.struct

  // TODO replace on loaded space after refactor this components

  return (
    <AuthorPreview
      address={ownerId}
      owner={owner}
      withFollowButton
      isShort={true}
      isPadded={false}
      size={size}
      details={<div>
        {withSpaceName && space && <>
          <SpaceNameAsLink space={space} className='DfGreyLink' />
          {' • '}
        </>}
        {space &&
          <ViewPostLink
            space={space.struct}
            post={post}
            title={formatDate(createdAtTime)}
            className='DfGreyLink'
          />
        }
      </div>}
    />
  )
}

type PostImageProps = {
  post: PostData,
  space: SpaceStruct
}

const PostImage = React.memo(({ post, space }: PostImageProps) => {
  const { content } = post
  const isMobile = useIsMobileWidthOrDevice()
  const image = content?.image

  if (!image || isEmptyStr(image)) return null

  return <DfBgImageLink
    href={'/[spaceId]/[slug]'}
    as={postUrl(space, post)}
    src={resolveIpfsUrl(image)}
    size={isMobile ? undefined : 170}
    className='DfPostImagePreview'
    // TODO add onError handler
    // TODO lazy load image.
  />
})

type PostSummaryProps = {
  space: SpaceStruct
  post: PostData
}

const PostSummary = React.memo(({ space, post }: PostSummaryProps) => {
  const { content } = post
  if (!content) return null

  const seeMoreLink = <BlackPostLink space={space} post={post} title='See More' />
  return <SummarizeMd content={content} more={seeMoreLink} />
})

type PostContentProps = {
  postDetails: PostWithSomeDetails,
  space: SpaceStruct,
  withImage?: boolean
}

type PostContentMemoizedProps = PostContentProps & {
  isMobile: boolean
}

const PostContentMemoized = React.memo((props: PostContentMemoizedProps) => {
  const { postDetails, space, withImage, isMobile } = props

  if (!postDetails) return null

  const { post } = postDetails
  const { content } = post

  if (!content || isEmptyObj(content)) return null

  return <div className='DfContent'>
    {isMobile && withImage && <PostImage post={post} space={space} />}
    <PostName post={postDetails} withLink />
    <PostSummary space={space} post={post} />
  </div>
})

export const PostContent = (props: PostContentProps) => {
  const isMobile = useIsMobileWidthOrDevice()
  return <PostContentMemoized isMobile={isMobile} {...props} />
}

type PostActionsPanelProps = {
  postDetails: PostWithSomeDetails,
  space: SpaceStruct,
  toogleCommentSection?: () => void,
  preview?: boolean,
  withBorder?: boolean
}

const ShowCommentsAction = (props: PostActionsPanelProps) => {
  const { postDetails, preview, toogleCommentSection } = props
  const { post: { struct: { repliesCount } } } = postDetails
  const title = 'Comment'

  return <Action onClick={toogleCommentSection} title={title}>
    <IconWithLabel
      icon={<MessageOutlined />}
      count={repliesCount}
      label={!preview ? title : undefined}
    />
  </Action>
}

const Action: FC<{ onClick?: () => void, title?: string }> =
  ({ children, onClick, title }) =>
    <Button onClick={onClick} title={title} className='DfAction'>{children}</Button>

export const PostActionsPanel: FC<PostActionsPanelProps> = (props) => {
  const { postDetails, space, preview, withBorder } = props
  const { post: { struct } } = postDetails

  const ReactionsAction = () =>
    <VoterButtons post={struct} className='DfAction' preview={preview} />

  return (
    <div className={`DfActionsPanel ${withBorder && 'DfActionBorder'}`}>
      {preview
        ? <ReactionsAction />
        : <div className='d-flex DfReactionsAction'>
          <ReactionsAction />
        </div>}
      {preview && <ShowCommentsAction {...props} />}
      <ShareDropdown postDetails={postDetails} space={space} className='DfAction' preview={preview} />
    </div>
  )
}

type PostPreviewProps = {
  postDetails: PostWithSomeDetails
  space: SpaceData
  withImage?: boolean
  withTags?: boolean
}

const SharedPostMd = (props: PostPreviewProps) => {
  const { postDetails: { post }, space } = props
  const { struct, content } = post

  return struct.isComment
    ? <DfMd source={content?.body} className='DfPostBody' />
    : <PostSummary space={space.struct} post={post} />
}

export const SharePostContent = (props: PostPreviewProps) => {
  const { postDetails: { ext } } = props

  const OriginalPost = () => {
    if (!ext || !ext.space) return <PostNotFound />

    const originalPost = ext.post.struct

    return <>
      {isVisible({ struct: originalPost, address: originalPost.ownerId })
        ? <RegularPreview postDetails={ext as PostWithAllDetails} space={ext.space} />
        : <PostNotFound />
      }
    </>
  }

  return <div className='DfSharedSummary'>
    <SharedPostMd {...props} />
    <Segment className='DfPostPreview'>
      <OriginalPost />
    </Segment>
  </div>
}

export const InfoPostPreview: FC<PostPreviewProps> = (props) => {
  const { postDetails, space, withImage = true, withTags } = props
  const { post: { struct, content } } = postDetails
  const isMobile = useIsMobileWidthOrDevice()

  if (!struct || !content) return null

  return <div className='DfInfo'>
    <div className='DfRow'>
      <div className='w-100'>
        <div className='DfRow'>
          <PostCreator postDetails={postDetails} space={space} withSpaceName />
          <PostDropDownMenu post={postDetails.post} space={space.struct} withEditButton />
        </div>
        <PostContent postDetails={postDetails} space={space.struct} withImage={withImage} />
        {withTags && <ViewTags tags={content?.tags} />}
        {/* {withStats && <StatsPanel id={post.id}/>} */}
      </div>
      {!isMobile && withImage && <PostImage post={postDetails.post} space={space.struct} />}
    </div>
  </div>
}

export const PostNotFound = () => <NoData description='Post not found' />

// TODO deprecated? currently this function is not used
// export const useSubscribedPost = (initPost: PostStruct) => {
//   const [ post, setPost ] = useState(initPost)

//   useSubsocialEffect(({ substrate: { api } }) => {
//     let unsub: { (): void | undefined; (): void; }

//     const sub = async () => {
//       const readyApi = await api
//       unsub = await readyApi.query.posts.postById(initPost.id, (data: Option<Post>) => {
//         if (data.isSome) {
//           setPost(flattenPostStruct(data.unwrap()))
//         }
//       })
//     }

//     sub()

//     return () => unsub && unsub()
//   }, [ initPost.id ])

//   return post
// }