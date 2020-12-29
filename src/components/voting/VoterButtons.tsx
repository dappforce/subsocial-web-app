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
import { getPostStructWithUpdatedCounts } from './utils'
import { useMyAddress } from '../auth/MyAccountContext'

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false })

type VoterProps = BareProps & {
  post: PostStruct,
  preview?: boolean
}

type VoterButtonProps = VoterProps & ButtonProps & {
  reactionEnum: ReactionEnum,
  reaction?: ReactionStruct,
  onSuccess?: () => void,
  preview?: boolean
};

const VoterButton = ({
  reactionEnum,
  reaction: oldReaction,
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
  const reloadPost = useCreateReloadPost()

  const { reactionId, kind: oldKind } = oldReaction || { id: postId } as ReactionStruct

  const newKind = reactionEnum.valueOf() as ReactionType
  const isUpvote = newKind === ReactionEnum.Upvote

  const count = isUpvote ? upvotesCount : downvotesCount
  const args = { id: postId }

  const buildTxParams = () => {
    if (!reactionId) {
      return [ postId, new ReactionKind(newKind) ]
    } else if (oldKind !== newKind) {
      return [ postId, reactionId, new ReactionKind(newKind) ]
    } else {
      return [ postId, reactionId ]
    }
  }

  const isActive = oldKind === newKind

  const color = isUpvote ? '#00a500' : '#ff0000'

  const changeReactionTx = isActive
    ? 'reactions.deletePostReaction'
    : 'reactions.updatePostReaction'

  const updateOrDelete = (deleteReaction: boolean, _newReactionId?: ReactionId) => {
    let newReactionId = _newReactionId || reactionId

    if (!newReactionId && !deleteReaction) {
      newReactionId = `fakeId-${postId}`
    }

    const newReaction: Reaction = { 
      reactionId: newReactionId,
      kind: deleteReaction ? undefined : newKind
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
      updateOrDelete(isActive)
      upserPost(getPostStructWithUpdatedCounts({ post, oldReaction, newKind }))
    }}
    onSuccess={(txResult) => {
      reloadPost(args)
      
      const newReactionId = reactionId || getNewIdsFromEvent(txResult)[1]?.toString()
      updateOrDelete(isActive, newReactionId)
      onSuccess && onSuccess()
    }}
    onFailed={() => {
      oldReaction && upsertReaction(oldReaction)
      upserPost(post)
    }}
    title={preview ? newKind : undefined}
    disabled={disabled}
  >
    <IconWithLabel
      icon={icon}
      count={count}
      label={(preview || isMobile) ? undefined : newKind}
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
  const myAddress = useMyAddress()
  const reaction = useAppSelector(state => selectPostMyReactionByPostId(state, { postId: props.post.id, myAddress }))
  
  return <InnerVoterButtons reaction={reaction} {...props} />
}

export const UpvoteVoterButton = (props: VoterProps) =>
  <VoterButtons kind={ReactionEnum.Upvote} {...props} />

export const DownvoteVoterButton = (props: VoterProps) =>
  <VoterButtons kind={ReactionEnum.Downvote} {...props} />
