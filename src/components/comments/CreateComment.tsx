import React from 'react'
import { PostExtension, Comment, OptionId, IpfsContent } from '@subsocial/types/substrate/classes'
import { useSubsocialApi } from '../utils/SubsocialApiContext'
import { IpfsCid, Post } from '@subsocial/types/substrate/interfaces'
import dynamic from 'next/dynamic'
import { getNewIdFromEvent, getTxParams } from '../substrate'
import BN from 'bn.js'
import { useDispatch } from 'react-redux'
import { useMyAccount } from '../auth/MyAccountContext'
import { useSetReplyToStore, useRemoveReplyFromStore, useChangeReplyToStore, buildMockComment, CommentTxButtonType } from './utils'
import { isHiddenPost, HiddenPostAlert } from '../posts/view-post'

const CommentEditor = dynamic(() => import('./CommentEditor'), { ssr: false })
const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false })

type NewCommentProps = {
  post: Post
  callback?: (id?: BN) => void
  withCancel?: boolean,
  asStub?: boolean
}

export const NewComment: React.FunctionComponent<NewCommentProps> = ({ post, callback, withCancel, asStub }) => {
  const { id: parentId, extension } = post
  const dispatch = useDispatch()
  const { subsocial } = useSubsocialApi()
  const { state: { address, account } } = useMyAccount()

  if (isHiddenPost(post)) {
    const msg = 'You cannot comment on this post because it is unlisted'
    return <HiddenPostAlert post={post} desc={msg} className='mt-3' />
  }

  const parentIdStr = parentId.toString()

  const comment = (extension.isComment && extension.asComment) || (extension as any).Comment

  const commentExt = comment
    ? new Comment({ parent_id: new OptionId(parentId), root_post_id: comment.root_post_id })
    : new Comment({ parent_id: new OptionId(), root_post_id: parentId })

  const newExtension = new PostExtension({ Comment: commentExt })

  const newTxParams = (cid: IpfsCid) => [ new OptionId(), newExtension, new IpfsContent(cid) ]

  const onFailedReduxAction = (id: string) =>
    useRemoveReplyFromStore(dispatch, { replyId: id, parentId: parentIdStr })

  const onSuccessReduxAction = (id: BN, fakeId: string) =>
    subsocial.findPostWithSomeDetails({ id })
      .then(comment => {
        comment && useChangeReplyToStore(
          dispatch,
          { replyId: fakeId, parentId: parentIdStr },
          {
            reply: { replyId: id.toString(), parentId: parentIdStr },
            comment: { ...comment, owner: account }
          }
        )
      })

  const onTxReduxAction = (body: string, fakeId: string) =>
    address && useSetReplyToStore(dispatch,
      {
        reply: { replyId: fakeId, parentId: parentIdStr },
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
