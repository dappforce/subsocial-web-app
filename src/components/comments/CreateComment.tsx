import React, { FC } from 'react'
import { PostExtension, Comment, OptionId, IpfsContent } from '@subsocial/types/substrate/classes'
import { useSubsocialApi } from '../utils/SubsocialApiContext'
import { IpfsCid } from '@subsocial/types/substrate/interfaces'
import dynamic from 'next/dynamic'
import { getNewIdFromEvent, getTxParams, newFlatApi } from '../substrate'
import BN from 'bn.js'
import { useDispatch } from 'react-redux'
import { useMyAccount } from '../auth/MyAccountContext'
import { useSetReplyToStore, useRemoveReplyFromStore, useChangeReplyToStore, buildMockComment, CommentTxButtonType } from './utils'
import { HiddenPostAlert } from '../posts/view-post'
import { asCommentStruct, idToPostId, PostStruct } from 'src/types'

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
  const dispatch = useDispatch()
  const { subsocial } = useSubsocialApi()
  const flatApi = newFlatApi(subsocial)
  const { state: { address, account } } = useMyAccount()

  if (post.hidden) {
    const msg = 'You cannot comment on this post because it is unlisted'
    return <HiddenPostAlert post={post} desc={msg} className='mt-3' />
  }

  let commentExt: Comment

  if (isComment) {
    const comment = asCommentStruct(post)
    const commentParentId = comment.parentId ? idToPostId(comment.parentId) : undefined

    commentExt = new Comment({
      parent_id: new OptionId(commentParentId),
      root_post_id: idToPostId(comment.rootPostId)
    })
  } else {
    commentExt = new Comment({
      parent_id: new OptionId(),
      root_post_id: idToPostId(post.id)
    })
  }

  const newExtension = new PostExtension({ Comment: commentExt })

  const newTxParams = (cid: IpfsCid) =>
    [ new OptionId(), newExtension, new IpfsContent(cid) ]

  const onFailedReduxAction = (id: string) =>
    useRemoveReplyFromStore(dispatch, { replyId: id, parentId })

  const onSuccessReduxAction = (id: BN, fakeId: string) =>
    flatApi.findPostWithSomeDetails({ id })
      .then(comment => {
        comment && useChangeReplyToStore(
          dispatch,
          {
            replyId: fakeId,
            parentId
          },
          {
            reply: { replyId: id.toString(), parentId },
            comment: { ...comment, owner: account }
          }
        )
      })

  const onTxReduxAction = (body: string, fakeId: string) =>
    address && useSetReplyToStore(dispatch, {
      reply: { replyId: fakeId, parentId },
      comment: buildMockComment({ fakeId, address, owner: account, content: { body } })
    })

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
        fakeId && onFailedReduxAction(fakeId)
        onFailed && onFailed(txResult)
      }}
      onSuccess={(txResult) => {
        const id = getNewIdFromEvent(txResult)
        id && fakeId && onSuccessReduxAction(id, fakeId)
        onSuccess && onSuccess(txResult)
      }}
      onClick={() => {
        fakeId && onTxReduxAction(json.body, fakeId)
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
