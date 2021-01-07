import React, { FC } from 'react'
import { PostExtension, Comment, OptionId, IpfsContent } from '@subsocial/types/substrate/classes'
import { useSubsocialApi } from '../utils/SubsocialApiContext'
import { IpfsCid } from '@subsocial/types/substrate/interfaces'
import dynamic from 'next/dynamic'
import { getNewIdFromEvent, getTxParams, newFlatApi } from '../substrate'
import BN from 'bn.js'
import { useMyAccount } from '../auth/MyAccountContext'
import { buildMockComment, CommentTxButtonType } from './utils'
import { HiddenPostAlert } from '../posts/view-post'
import { asCommentStruct, convertToDerivedContent, idToPostId, PostData, PostStruct } from 'src/types'
import { useCreateChangeReplies, useRemoveReply, useCreateUpsertReply } from 'src/rtk/features/replies/repliesHooks'
import { useCreateUpsertPost } from 'src/rtk/app/hooks'

const CommentEditor = dynamic(() => import('./CommentEditor'), { ssr: false })
const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false })

type NewCommentProps = {
  post: PostStruct
  callback?: (id?: BN) => void
  withCancel?: boolean
  asStub?: boolean
}

export const NewComment: FC<NewCommentProps> = ({ post, callback, withCancel, asStub }) => {
  const { id: parentId, isComment } = post
  const { subsocial } = useSubsocialApi()
  const flatApi = newFlatApi(subsocial)
  const { state: { address } } = useMyAccount()
  const changeReply = useCreateChangeReplies()
  const removeReply = useRemoveReply()
  const upsertReply = useCreateUpsertReply()
  const upsertPost = useCreateUpsertPost()

  if (post.hidden) {
    const msg = 'You cannot comment on this post because it is unlisted'
    return <HiddenPostAlert post={post} desc={msg} className='mt-3' />
  }

  let rootPostId = parentId
  let commentExt: Comment

  if (isComment) {
    const comment = asCommentStruct(post)
    rootPostId = comment.rootPostId

    commentExt = new Comment({
      parent_id: new OptionId(idToPostId(parentId)),
      root_post_id: idToPostId(rootPostId)
    })
  } else {
    commentExt = new Comment({
      parent_id: new OptionId(),
      root_post_id: idToPostId(rootPostId)
    })
  }

  const newExtension = new PostExtension({ Comment: commentExt })

  const newTxParams = (cid: IpfsCid) =>
    [ new OptionId(), newExtension, new IpfsContent(cid) ]

  const replaceTempReplyWithOnChainVersion = (onChainId: BN, fakeId: string) =>
    flatApi.findPostWithSomeDetails({ id: onChainId }).then(reply => {
      reply && changeReply({
        reply: reply.post.struct,
        rootPostId,
        parentId,
        idToRemove: fakeId
      })
    })

  const putTempReplyInReduxStore = (replyBody: string, fakeId: string) => {
    if (!address) return

    const replyData = {
      struct: buildMockComment({ fakeId, address }),
      content: convertToDerivedContent({ body: replyBody })
    } as PostData
  
    // Put a temp reply in Redux store:
    upsertReply({ replyData, parentId })

    // Increment a number of replies on a parent post:
    upsertPost({ ...post, repliesCount: post.repliesCount + 1 })
  }

  const removeTempReplyFromReduxStore = (fakeId: string) => {
    // Put a temp reply in Redux store:
    removeReply({ replyId: fakeId, parentId })

    // Reset a parent post to its initial state:
    upsertPost(post)
  }

  const buildTxButton = ({ disabled, json, fakeId, ipfs, setIpfsCid, onClick, onFailed, onSuccess }: CommentTxButtonType) =>
    <TxButton
      type='primary'
      label='Comment'
      disabled={disabled}
      params={() => getTxParams({
        json: json,
        buildTxParamsCallback: newTxParams,
        ipfs,
        setIpfsCid
      })}
      tx='posts.createPost'
      onFailed={(txResult) => {
        fakeId && removeTempReplyFromReduxStore(fakeId)
        onFailed && onFailed(txResult)
      }}
      onSuccess={(txResult) => {
        const onChainId = getNewIdFromEvent(txResult)
        onChainId && fakeId && replaceTempReplyWithOnChainVersion(onChainId, fakeId)
        onSuccess && onSuccess(txResult)
      }}
      onClick={() => {
        fakeId && putTempReplyInReduxStore(json.body, fakeId)
        onClick && onClick()
      }}
    />

  return <CommentEditor
    callback={callback}
    CommentTxButton={buildTxButton}
    withCancel={withCancel}
    asStub={asStub}
  />
}
