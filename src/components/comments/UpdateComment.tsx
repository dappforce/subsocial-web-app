import React from 'react';
import { PostUpdate, OptionBool } from '@subsocial/types/substrate/classes';
import { IpfsHash, Post } from '@subsocial/types/substrate/interfaces';
import { SubmittableResult } from '@polkadot/api';
import dynamic from 'next/dynamic';
import { CommentContent, PostContent } from '@subsocial/types';
import { registry } from '@subsocial/react-api';
import { Option } from '@polkadot/types/codec';
import { getTxParams } from '../utils/substrate';
import BN from 'bn.js'
import { useDispatch } from 'react-redux';
import { useEditReplyToStore, CommentTxButtonType } from './utils';
import { InnerEditComment } from './InnerEditComment';

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

type FCallback = (id?: BN) => void

type EditCommentProps = {
  struct: Post,
  content: CommentContent,
  callback?: FCallback
}

export const EditComment: React.FunctionComponent<EditCommentProps> = ({ struct, content, callback }) => {

  const dispatch = useDispatch();

  const newTxParams = (hash: IpfsHash) => {
    const update = new PostUpdate(
      {
      // TODO setting new space_id will move the post to another space.
        space_id: new Option(registry, 'u64', null),
        ipfs_hash: new Option(registry, 'Text', hash),
        hidden: new OptionBool(false) // TODO has no implementation on UI
      });
    return [ struct.id, update ];
  }

  const id = struct.id.toString()

  const updatePostToStore = (content: PostContent) => useEditReplyToStore(dispatch, { replyId: id, comment: { struct, content } })

  const buildTxButton = ({ isDisabled, json, ipfs, setIpfsHash, onClick, onFailed }: CommentTxButtonType) => {

    return <TxButton
      label='Edit'
      isDisabled={isDisabled}
      params={() => getTxParams({
        json: json,
        buildTxParamsCallback: newTxParams,
        ipfs,
        setIpfsHash
      })}
      tx='posts.updatePost'
      onFailed={(txResult: SubmittableResult | null) => {
        updatePostToStore(content as PostContent)
        onFailed && onFailed(txResult)
      }}
      onClick={() => {
        updatePostToStore(json as PostContent)
        onClick && onClick()
      }}
    />
  };

  return <InnerEditComment
    callback={callback}
    content={content}
    CommentTxButton={buildTxButton}
    withCancel
  />;
}
