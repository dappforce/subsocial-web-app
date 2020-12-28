import React from 'react'
import { LikeTwoTone, LikeOutlined, DislikeTwoTone, DislikeOutlined } from '@ant-design/icons'
import dynamic from 'next/dynamic'
import { ReactionKind } from '@subsocial/types/substrate/classes'
import { BareProps } from '../utils/types'
import { IconWithLabel } from '../utils'
import { useResponsiveSize } from '../responsive'
import { PostStruct, ReactionEnum, ReactionType } from 'src/types'
import { useCreateReloadPost, useCreateUpsertPost } from 'src/rtk/app/hooks'
import { Reaction, ReactionId, ReactionStruct, selectPostMyReactionByPostId } from 'src/rtk/features/reactions/myPostReactionsSlice'
import { ButtonProps } from 'antd/lib/button'
import { useCreateUpsertReaction } from 'src/rtk/features/reactions/myPostReactionsHooks'
import { useAppSelector } from 'src/rtk/app/store'
import { getNewIdsFromEvent } from '../substrate'

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false })

type VoterProps = BareProps & {
  post: PostStruct,
  preview?: boolean
}

type VoterButtonProps = VoterProps & ButtonProps & {
  reactionEnum: ReactionEnum,
  reaction?: Reaction,
  onSuccess?: () => void,
  preview?: boolean
};

const VoterButton = ({
  reactionEnum,
  reaction,
  post,
  className,
  style,
  onSuccess,
  preview,
  disabled
}: VoterButtonProps) => {

  const { id: postId, upvotesCount, downvotesCount } = post
  const { isMobile } = useResponsiveSize()
  const upsertReaction = useCreateUpsertReaction()
  const upserPost = useCreateUpsertPost()
  const { reactionId, kind = 'None' } = reaction || { id: postId } as ReactionStruct
  const reactionType = reactionEnum.valueOf() as ReactionType
  const isUpvote = reactionType === ReactionEnum.Upvote
  const count = isUpvote ? upvotesCount : downvotesCount
  const reloadPost = useCreateReloadPost()
  const args = { id: postId }

  const buildTxParams = () => {
    if (reactionId === undefined) {
      return [ postId, new ReactionKind(reactionType) ]
    } else if (kind !== reactionType) {
      return [ postId, reactionId, new ReactionKind(reactionType) ]
    } else {
      return [ postId, reactionId ]
    }
  }

  const isActive = kind === reactionType

  const color = isUpvote ? '#00a500' : '#ff0000'

  const isDelete = kind === reactionType
  const changeReactionTx = isDelete
    ? 'reactions.deletePostReaction'
    : 'reactions.updatePostReaction'

  const updateOrDelete = (isDelete: boolean, _reactinoId?: ReactionId) => {
    const newReactionId = _reactinoId || reactionId
    const newReaction: Reaction = { 
      reactionId: newReactionId || `fakeId-${postId}`,
      kind: isDelete ? undefined : reactionType
    }

    upsertReaction({ id: postId, ...newReaction })
  }

  let icon: JSX.Element
  if (isUpvote) {
    icon = isActive
      ? <LikeTwoTone twoToneColor={color} />
      : <LikeOutlined />
  } else {
    icon = isActive
      ? <DislikeTwoTone twoToneColor={color} />
      : <DislikeOutlined />
  }

  return <TxButton
    className={`DfVoterButton ${className}`}
    style={{
      color: isActive ? color : '',
      ...style
    }}
    tx={!reactionId
      ? 'reactions.createPostReaction'
      : changeReactionTx
    }
    params={buildTxParams()}
    onClick={() => {
      updateOrDelete(isDelete)

      const currentCountKey = reactionType === 'Upvote' ? 'upvotesCount' : 'downvotesCount'
      let currentCount = post[currentCountKey]

      upserPost({
        ...post,
        [currentCountKey]: isDelete ? --currentCount : ++currentCount
      })
    }}
    onSuccess={(txResult) => {
      reloadPost(args)
      
      const newReactionId = reactionId || getNewIdsFromEvent(txResult)[1]?.toString()
      updateOrDelete(isDelete, newReactionId)
      onSuccess && onSuccess()
    }}
    onFailed={() => {
      upsertReaction({ id: postId, ...reaction })
      upserPost(post)
    }}
    title={preview ? reactionType : undefined}
    disabled={disabled}
  >
    <IconWithLabel
      icon={icon}
      count={count}
      label={(preview || isMobile) ? undefined : reactionType}
    />
  </TxButton>
}

type VoterButtonsProps = VoterProps & {
  kind?: ReactionEnum,
}

type InnerVoterButtonsProps = VoterButtonsProps & {
  reaction?: ReactionStruct
}

const InnerVoterButtons = ({ kind, ...buttonProps }: InnerVoterButtonsProps) => {
  return <>
    {kind !== ReactionEnum.Upvote &&
      <VoterButton reactionEnum={ReactionEnum.Upvote} {...buttonProps} />}
    {kind !== ReactionEnum.Downvote &&
      <VoterButton reactionEnum={ReactionEnum.Downvote} {...buttonProps} />}
  </>
}

export const VoterButtons = (props: VoterButtonsProps) => {
  const reaction = useAppSelector(state => selectPostMyReactionByPostId(state, props.post.id))

  return <InnerVoterButtons reaction={reaction} {...props} />
}

export const UpvoteVoterButton = (props: VoterProps) =>
  <VoterButtons kind={ReactionEnum.Upvote} {...props} />

export const DownvoteVoterButton = (props: VoterProps) =>
  <VoterButtons kind={ReactionEnum.Downvote} {...props} />
