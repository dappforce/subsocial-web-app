import React, { FC } from 'react'
import { PostUpdate, OptionBool, OptionIpfsContent } from '@subsocial/types/substrate/classes'
import { IpfsCid } from '@subsocial/types/substrate/interfaces'
import dynamic from 'next/dynamic'
import { CommentContent } from '@subsocial/types'
import { registry } from '@subsocial/types/substrate/registry'
import { Option } from '@polkadot/types/codec'
import { getTxParams } from '../substrate'
import BN from 'bn.js'
import { CommentTxButtonType } from './utils'
import { PostContent, PostStruct } from 'src/types'
import { useCreateUpsertReply } from 'src/rtk/features/replies/repliesHooks'
import { useCreateReloadPost } from 'src/rtk/app/hooks'

const CommentEditor = dynamic(() => import('./CommentEditor'), { ssr: false })
const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false })

type FCallback = (id?: BN) => void

type EditCommentProps = {
  struct: PostStruct,
  content: CommentContent,
  callback?: FCallback
}

export const EditComment: FC<EditCommentProps> = ({ struct, content, callback }) => {

  const upsertReply = useCreateUpsertReply()
  const reloadPost = useCreateReloadPost()
  const id = struct.id

  const newTxParams = (hash: IpfsCid) => {
    const update = new PostUpdate({
      // TODO setting a new space_id will move the post to another space.
      space_id: new Option(registry, 'u64', null),
      content: new OptionIpfsContent(hash),
      hidden: new OptionBool(false) // TODO has no implementation on UI
    })
    return [ id, update ]
  }

  const upsertPostContent = (content: PostContent) =>
    upsertReply({
      replyData: {
        id,
        struct,
        content
      }
    })

  const buildTxButton = ({ disabled, json, ipfs, setIpfsCid, onClick, onFailed, onSuccess }: CommentTxButtonType) =>
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
        upsertPostContent(content as PostContent)
        onFailed && onFailed(txResult)
      }}
      onClick={() => {
        upsertPostContent(json as PostContent)
        onClick && onClick()
      }}
      onSuccess={(txResult) => {
        reloadPost({ id })
        onSuccess && onSuccess(txResult)
      }}
    />

  return <CommentEditor
    callback={callback}
    content={content}
    CommentTxButton={buildTxButton}
    withCancel
  />
}
