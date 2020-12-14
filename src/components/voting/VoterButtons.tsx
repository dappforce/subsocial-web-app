import React, { useCallback } from 'react'
import { LikeTwoTone, LikeOutlined, DislikeTwoTone, DislikeOutlined } from '@ant-design/icons'
import dynamic from 'next/dynamic'
import { ReactionKind } from '@subsocial/types/substrate/classes'
import { BareProps } from '../utils/types'
import { IconWithLabel } from '../utils'
import { useResponsiveSize } from '../responsive'
import { PostStruct } from 'src/types'
import { useGetReloadPost } from 'src/rtk/app/hooks'
import { Reaction, ReactionEnum, selectPostReactionByPostId } from 'src/rtk/features/reactions/postReactionsSlice'
import { ButtonProps } from 'antd/lib/button'
import { useGetReloadReaction } from 'src/rtk/features/reactions/postReactionsHooks'
import { useAppSelector } from 'src/rtk/app/store'

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
  const reactionType = reactionEnum.valueOf()

  const kind = reaction ? reaction.kind : 'None'
  const isUpvote = reactionType === ReactionEnum.Upvote
  const count = isUpvote ? upvotesCount : downvotesCount

  console.log('kind', kind, reactionType)

  const buildTxParams = () => {
    if (reaction === undefined) {
      return [ id, new ReactionKind(reactionType) ]
    } else if (kind !== reactionType) {
      return [ id, reaction.id, new ReactionKind(reactionType) ]
    } else {
      return [ id, reaction.id ]
    }
  }

  const isActive = kind === reactionType

  const color = isUpvote ? '#00a500' : '#ff0000'

  const changeReactionTx = kind !== reactionType
    ? 'reactions.updatePostReaction'
    : 'reactions.deletePostReaction'

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

  console.log('changeReactionTx', changeReactionTx)

  return <TxButton
    className={`DfVoterButton ${className}`}
    style={{
      color: isActive ? color : '',
      ...style
    }}
    tx={!reaction
      ? 'reactions.createPostReaction'
      : changeReactionTx
    }
    params={buildTxParams()}
    onSuccess={onSuccess}
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
  const reloadReaction = useGetReloadReaction()
  const args = { id: post.id }
  const reaction = useAppSelector(state => selectPostReactionByPostId(state, post.id))?.reaction

  const renderVoterButton = useCallback((reactionType: ReactionEnum) => <VoterButton
    reaction={reaction}
    reactionEnum={reactionType}
    onSuccess={() => {
      console.log('SUCCESS')
      reloadPost(args)
      reloadReaction(args)
    }}
    post={post}
    {...voterProps}
  />, [ post.id ])

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
