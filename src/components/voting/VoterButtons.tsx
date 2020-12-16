import React, { useCallback } from 'react'
import { LikeTwoTone, LikeOutlined, DislikeTwoTone, DislikeOutlined } from '@ant-design/icons'
import dynamic from 'next/dynamic'
import { ReactionKind } from '@subsocial/types/substrate/classes'
import { BareProps } from '../utils/types'
import { IconWithLabel } from '../utils'
import { useResponsiveSize } from '../responsive'
import { PostStruct } from 'src/types'
import { useGetReloadPost } from 'src/rtk/app/hooks'
import { Reaction, ReactionEnum, ReactionId, ReactionStruct, ReactionType, selectPostReactionByPostId } from 'src/rtk/features/reactions/postReactionsSlice'
import { ButtonProps } from 'antd/lib/button'
import { useGetUpsertReaction } from 'src/rtk/features/reactions/postReactionsHooks'
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
  post: { id, upvotesCount, downvotesCount },
  className,
  style,
  onSuccess,
  preview,
  disabled
}: VoterButtonProps) => {

  const { isMobile } = useResponsiveSize()
  const upsertReaction = useGetUpsertReaction()
  const { reactionId, kind = 'None' } = reaction || { id } as ReactionStruct
  const reactionType = reactionEnum.valueOf() as ReactionType
  const isUpvote = reactionType === ReactionEnum.Upvote
  const count = isUpvote ? upvotesCount : downvotesCount

  const buildTxParams = () => {
    if (reactionId === undefined) {
      return [ id, new ReactionKind(reactionType) ]
    } else if (kind !== reactionType) {
      return [ id, reactionId, new ReactionKind(reactionType) ]
    } else {
      return [ id, reactionId ]
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
    const newReaction: Reaction | undefined = isDelete
      ? {}
      : { reactionId: newReactionId || `fakeId-${id}`, kind: reactionType }

    upsertReaction({ id, ...newReaction })
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
    onClick={() => updateOrDelete(isDelete)}
    onSuccess={(txResult) => {
      const newReactionId = reactionId || getNewIdsFromEvent(txResult)[1]?.toString()
      updateOrDelete(isDelete, newReactionId)
      onSuccess && onSuccess()
    }}
    onFailed={() => {
      upsertReaction({ id, ...reaction })
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
  only?: ReactionEnum,
}

export const VoterButtons = (props: VoterButtonsProps) => {
  const { post, only, ...voterProps } = props
  const reloadPost = useGetReloadPost()
  const args = { id: post.id }
  const reaction = useAppSelector(state => selectPostReactionByPostId(state, post.id))

  const renderVoterButton = useCallback((reactionType: ReactionEnum) => <VoterButton
    reaction={reaction}
    reactionEnum={reactionType}
    onSuccess={() => reloadPost(args)}
    post={post}
    {...voterProps}
  />, [ post.id, reaction?.kind || 'None' ])

  const UpvoteButton = () => only !== ReactionEnum.Upvote ? renderVoterButton(ReactionEnum.Upvote) : null
  const DownvoteButton = () => only !== ReactionEnum.Downvote ? renderVoterButton(ReactionEnum.Downvote) : null

  return <>
    <UpvoteButton />
    <DownvoteButton />
  </>
}

export const UpvoteVoterButton = (props: VoterProps) =>
  <VoterButtons only={ReactionEnum.Upvote} {...props} />

export const DownvoteVoterButton = (props: VoterProps) =>
  <VoterButtons only={ReactionEnum.Downvote} {...props} />
