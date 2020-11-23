import React from 'react'
import { PostUpdate, OptionBool, OptionIpfsContent } from '@subsocial/types/substrate/classes'
import { IpfsCid, Post } from '@subsocial/types/substrate/interfaces'
import dynamic from 'next/dynamic'
import { CommentContent, PostContent } from '@subsocial/types'
import { registry } from '@subsocial/types/substrate/registry'
import { Option } from '@polkadot/types/codec'
import { getTxParams } from '../substrate'
import BN from 'bn.js'
import { useDispatch } from 'react-redux'
import { useEditReplyToStore, CommentTxButtonType } from './utils'

const CommentEditor = dynamic(() => import('./CommentEditor'), { ssr: false })
const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false })

type FCallback = (id?: BN) => void

type EditCommentProps = {
  struct: Post,
  content: CommentContent,
  callback?: FCallback
}

export const EditComment: React.FunctionComponent<EditCommentProps> = ({ struct, content, callback }) => {

  const dispatch = useDispatch()

  const newTxParams = (hash: IpfsCid) => {
    const update = new PostUpdate(
      {
      // TODO setting new space_id will move the post to another space.
        space_id: new Option(registry, 'u64', null),
        content: new OptionIpfsContent(hash),
        hidden: new OptionBool(false) // TODO has no implementation on UI
      })
    return [ struct.id, update ]
  }

  const id = struct.id.toString()

  const updatePostToStore = (content: PostContent) => useEditReplyToStore(dispatch, { replyId: id, comment: { struct, content } })

  const buildTxButton = ({ disabled, json, ipfs, setIpfsCid, onClick, onFailed }: CommentTxButtonType) =>
    <TxButton
      type='primary'
      label='Edit'
      disabled={disabled}
      params={() => getTxParams({
        json: json,
        buildTxParamsCallback: newTxParams,
        ipfs,
        setIpfsCid
      })}
      tx='posts.updatePost'
      onFailed={(txResult) => {
        updatePostToStore(content as PostContent)
        onFailed && onFailed(txResult)
      }}
      onClick={() => {
        updatePostToStore(json as PostContent)
        onClick && onClick()
      }}
    />

  return <CommentEditor
    callback={callback}
    content={content}
    CommentTxButton={buildTxButton}
    withCancel
  />
}
