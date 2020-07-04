import React from 'react';
import { PostExtension, CommentExt, OptionId } from '@subsocial/types/substrate/classes';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { IpfsHash, Post } from '@subsocial/types/substrate/interfaces';
import { SubmittableResult } from '@polkadot/api';
import dynamic from 'next/dynamic';
import { getNewIdFromEvent, getTxParams } from '../utils/substrate';
import BN from 'bn.js'
import { useDispatch } from 'react-redux';
import { useMyAddress } from '../auth/MyAccountContext';
import { useSetReplyToStore, useRemoveReplyFromStore, useChangeReplyToStore, buildMockComment, CommentTxButtonType } from './utils';
import { InnerEditComment } from './InnerEditComment';

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

type FCallback = (id?: BN) => void

type NewCommentProps = {
  post: Post,
  callback?: FCallback,
  withCancel?: boolean
}

export const NewComment: React.FunctionComponent<NewCommentProps> = ({ post, callback, withCancel }) => {
  const { id: parentId, extension } = post;
  const dispatch = useDispatch();
  const { subsocial } = useSubsocialApi()
  const account = useMyAddress()

  const parentIdStr = parentId.toString()

  const comment = (extension.isComment && extension.asComment) || (extension as any).Comment

  const commentExt = comment
    ? new CommentExt({ parent_id: new OptionId(parentId), root_post_id: comment.root_post_id })
    : new CommentExt({ parent_id: new OptionId(), root_post_id: parentId })

  const newExtension = new PostExtension({ Comment: commentExt })

  const newTxParams = (hash: IpfsHash) => [ new OptionId(), newExtension, hash ];

  const onFailedReduxAction = (id: string) => useRemoveReplyFromStore(dispatch, { replyId: id, parentId: parentIdStr })
  const onSuccessReduxAction = (id: BN, fakeId: string) => subsocial.findPostWithSomeDetails({ id }).then(comment => {
    comment && useChangeReplyToStore(
      dispatch,
      { replyId: fakeId, parentId: parentIdStr },
      { reply: { replyId: id.toString(), parentId: parentIdStr },
        comment
      }
    )
  })
  const onTxReduxAction = (body: string, fakeId: string) => {
    account && useSetReplyToStore(dispatch,
      {
        reply: { replyId: fakeId, parentId: parentIdStr },
        comment: buildMockComment({ fakeId, account, content: { body } })
      })
  }

  const buildTxButton = ({ disabled, json, fakeId, ipfs, setIpfsHash, onClick, onFailed, onSuccess }: CommentTxButtonType) =>
    <TxButton
      type='primary'
      label='Comment'
      disabled={disabled}
      params={() => getTxParams({
        json: json,
        buildTxParamsCallback: newTxParams,
        ipfs,
        setIpfsHash
      })}
      tx='posts.createPost'
      onFailed={(txResult: SubmittableResult | null) => {
        fakeId && onFailedReduxAction(fakeId)
        onFailed && onFailed(txResult)
      }}
      onSuccess={(txResult: SubmittableResult) => {
        const id = getNewIdFromEvent(txResult);
        id && fakeId && onSuccessReduxAction(id, fakeId)
        onSuccess && onSuccess(txResult)
      }}
      onClick={() => {
        fakeId && onTxReduxAction(json.body, fakeId)
        onClick && onClick()
      }}
    />

  return <InnerEditComment
    callback={callback}
    CommentTxButton={buildTxButton}
    withCancel={withCancel} />;
}
